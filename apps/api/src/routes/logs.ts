import { Router } from "express";
import { createLogSchema } from "@meditime/shared";
import { prisma } from "../db/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const logsRouter = Router();

logsRouter.use(requireAuth);

// History for the signed-in user, most recent first. Optional ?since=ISO date.
logsRouter.get("/", async (req, res) => {
  const since = typeof req.query.since === "string" ? new Date(req.query.since) : null;

  const rows = await prisma.medicineLog.findMany({
    where: {
      userId: req.user!.id,
      ...(since && !Number.isNaN(since.getTime()) ? { scheduledFor: { gte: since } } : {}),
    },
    orderBy: { scheduledFor: "desc" },
    take: 500,
  });

  res.json(rows);
});

// Upsert-by-occurrence: mark a scheduled dose taken/missed/skipped.
logsRouter.post("/", async (req, res) => {
  const parsed = createLogSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const input = parsed.data;

  const medicine = await prisma.medicine.findFirst({
    where: { id: input.medicineId, userId: req.user!.id },
    select: { id: true },
  });

  if (!medicine) {
    res.status(404).json({ error: "Medicine not found" });
    return;
  }

  const row = await prisma.medicineLog.create({
    data: {
      medicineId: input.medicineId,
      userId: req.user!.id,
      scheduledFor: new Date(input.scheduledFor),
      status: input.status,
      respondedAt: new Date(),
    },
  });

  res.status(201).json(row);
});
