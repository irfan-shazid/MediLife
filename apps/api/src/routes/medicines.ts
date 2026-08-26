import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { createMedicineSchema, updateMedicineSchema } from "@meditime/shared";
import { db } from "../db/index.js";
import { medicines } from "../db/schema.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const medicinesRouter = Router();

medicinesRouter.use(requireAuth);

medicinesRouter.get("/", async (req, res) => {
  const rows = await db
    .select()
    .from(medicines)
    .where(eq(medicines.userId, req.user!.id))
    .orderBy(medicines.createdAt);
  res.json(rows);
});

medicinesRouter.get("/:id", async (req, res) => {
  const [row] = await db
    .select()
    .from(medicines)
    .where(and(eq(medicines.id, req.params.id), eq(medicines.userId, req.user!.id)));

  if (!row) {
    res.status(404).json({ error: "Medicine not found" });
    return;
  }
  res.json(row);
});

medicinesRouter.post("/", async (req, res) => {
  const parsed = createMedicineSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const input = parsed.data;
  const [row] = await db
    .insert(medicines)
    .values({
      userId: req.user!.id,
      name: input.name,
      dosage: input.dosage || null,
      notes: input.notes || null,
      color: input.color,
      icon: input.icon,
      times: input.times,
      daysOfWeek: input.daysOfWeek,
      startDate: input.startDate,
      endDate: input.endDate ?? null,
      isActive: input.isActive,
    })
    .returning();

  res.status(201).json(row);
});

medicinesRouter.patch("/:id", async (req, res) => {
  const parsed = updateMedicineSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const input = parsed.data;
  const [existing] = await db
    .select({ id: medicines.id })
    .from(medicines)
    .where(and(eq(medicines.id, req.params.id), eq(medicines.userId, req.user!.id)));

  if (!existing) {
    res.status(404).json({ error: "Medicine not found" });
    return;
  }

  const [row] = await db
    .update(medicines)
    .set({
      ...input,
      dosage: input.dosage === "" ? null : input.dosage,
      notes: input.notes === "" ? null : input.notes,
      updatedAt: new Date(),
    })
    .where(eq(medicines.id, req.params.id))
    .returning();

  res.json(row);
});

medicinesRouter.delete("/:id", async (req, res) => {
  const result = await db
    .delete(medicines)
    .where(and(eq(medicines.id, req.params.id), eq(medicines.userId, req.user!.id)))
    .returning({ id: medicines.id });

  if (result.length === 0) {
    res.status(404).json({ error: "Medicine not found" });
    return;
  }
  res.status(204).send();
});
