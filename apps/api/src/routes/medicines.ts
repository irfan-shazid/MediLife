import { Router, type Request } from "express";
import type { Medicine as PrismaMedicine, NotificationSound as PrismaSound } from "@prisma/client";
import { createMedicineSchema, updateMedicineSchema } from "@meditime/shared";
import { prisma } from "../db/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const medicinesRouter = Router();

medicinesRouter.use(requireAuth);

function dateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function soundDTO(req: Request, sound: PrismaSound) {
  const base = `${req.protocol}://${req.get("host")}`;
  return {
    id: sound.id,
    name: sound.name,
    url: `${base}/uploads/sounds/${sound.fileName}`,
    mimeType: sound.mimeType,
    sizeBytes: sound.sizeBytes,
    isDefault: sound.isDefault,
    uploadedBy: sound.uploadedBy,
    createdAt: sound.createdAt,
  };
}

// Prisma returns `@db.Date` columns as Date objects and `Json` columns as
// `JsonValue` — reshape to the plain-string/typed-array DTO the mobile app
// (and @meditime/shared) expects.
function toDTO(req: Request, m: PrismaMedicine & { sound: PrismaSound | null }) {
  return {
    ...m,
    times: m.times as string[],
    daysOfWeek: m.daysOfWeek as number[],
    startDate: dateOnly(m.startDate),
    endDate: m.endDate ? dateOnly(m.endDate) : null,
    sound: m.sound ? soundDTO(req, m.sound) : null,
  };
}

// A soundId is only valid to attach if it's an admin default or the caller's
// own upload — otherwise a user could point their medicine at someone else's
// private sound.
async function assertSoundAccessible(soundId: string, userId: string) {
  const sound = await prisma.notificationSound.findFirst({
    where: { id: soundId, OR: [{ isDefault: true }, { uploadedBy: userId }] },
    select: { id: true },
  });
  return !!sound;
}

medicinesRouter.get("/", async (req, res) => {
  const rows = await prisma.medicine.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "asc" },
    include: { sound: true },
  });
  res.json(rows.map((r) => toDTO(req, r)));
});

medicinesRouter.get("/:id", async (req, res) => {
  const row = await prisma.medicine.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
    include: { sound: true },
  });

  if (!row) {
    res.status(404).json({ error: "Medicine not found" });
    return;
  }
  res.json(toDTO(req, row));
});

medicinesRouter.post("/", async (req, res) => {
  const parsed = createMedicineSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const input = parsed.data;
  if (input.soundId && !(await assertSoundAccessible(input.soundId, req.user!.id))) {
    res.status(400).json({ error: "Sound not found" });
    return;
  }

  const row = await prisma.medicine.create({
    data: {
      userId: req.user!.id,
      name: input.name,
      dosage: input.dosage || null,
      notes: input.notes || null,
      color: input.color,
      icon: input.icon,
      times: input.times,
      daysOfWeek: input.daysOfWeek,
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : null,
      isActive: input.isActive,
      soundId: input.soundId ?? null,
    },
    include: { sound: true },
  });

  res.status(201).json(toDTO(req, row));
});

medicinesRouter.patch("/:id", async (req, res) => {
  const parsed = updateMedicineSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const input = parsed.data;
  const existing = await prisma.medicine.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
    select: { id: true },
  });

  if (!existing) {
    res.status(404).json({ error: "Medicine not found" });
    return;
  }

  if (input.soundId && !(await assertSoundAccessible(input.soundId, req.user!.id))) {
    res.status(400).json({ error: "Sound not found" });
    return;
  }

  const row = await prisma.medicine.update({
    where: { id: req.params.id },
    data: {
      ...input,
      dosage: input.dosage === "" ? null : input.dosage,
      notes: input.notes === "" ? null : input.notes,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate === undefined ? undefined : input.endDate ? new Date(input.endDate) : null,
    },
    include: { sound: true },
  });

  res.json(toDTO(req, row));
});

medicinesRouter.delete("/:id", async (req, res) => {
  const existing = await prisma.medicine.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
    select: { id: true },
  });

  if (!existing) {
    res.status(404).json({ error: "Medicine not found" });
    return;
  }

  await prisma.medicine.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
