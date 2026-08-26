import { Router } from "express";
import { and, desc, eq, gte } from "drizzle-orm";
import { createLogSchema } from "@meditime/shared";
import { db } from "../db/index.js";
import { medicineLogs, medicines } from "../db/schema.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const logsRouter = Router();

logsRouter.use(requireAuth);

// History for the signed-in user, most recent first. Optional ?since=ISO date.
logsRouter.get("/", async (req, res) => {
  const since = typeof req.query.since === "string" ? new Date(req.query.since) : null;

  const rows = await db
    .select()
    .from(medicineLogs)
    .where(
      since && !Number.isNaN(since.getTime())
        ? and(eq(medicineLogs.userId, req.user!.id), gte(medicineLogs.scheduledFor, since))
        : eq(medicineLogs.userId, req.user!.id),
    )
    .orderBy(desc(medicineLogs.scheduledFor))
    .limit(500);

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

  const [medicine] = await db
    .select({ id: medicines.id })
    .from(medicines)
    .where(and(eq(medicines.id, input.medicineId), eq(medicines.userId, req.user!.id)));

  if (!medicine) {
    res.status(404).json({ error: "Medicine not found" });
    return;
  }

  const [row] = await db
    .insert(medicineLogs)
    .values({
      medicineId: input.medicineId,
      userId: req.user!.id,
      scheduledFor: new Date(input.scheduledFor),
      status: input.status,
      respondedAt: new Date(),
    })
    .returning();

  res.status(201).json(row);
});
