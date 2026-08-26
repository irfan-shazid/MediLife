import { Router } from "express";
import type { AdminStats } from "@meditime/shared";
import { prisma } from "../db/prisma.js";
import { requireAdmin, requireAuth } from "../middleware/requireAuth.js";

export const adminStatsRouter = Router();

adminStatsRouter.use(requireAuth, requireAdmin);

adminStatsRouter.get("/", async (_req, res) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalUsers, newUsersLast7Days, totalMedicines, activeMedicines, totalDosesLogged, takenDoses, recentUsers] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.medicine.count(),
      prisma.medicine.count({ where: { isActive: true } }),
      prisma.medicineLog.count(),
      prisma.medicineLog.count({ where: { status: "taken" } }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, name: true, email: true, createdAt: true },
      }),
    ]);

  const stats: AdminStats = {
    totalUsers,
    newUsersLast7Days,
    totalMedicines,
    activeMedicines,
    adherenceRate: totalDosesLogged > 0 ? takenDoses / totalDosesLogged : 0,
    totalDosesLogged,
  };

  res.json({ stats, recentUsers });
});
