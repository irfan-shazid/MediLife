import { Router } from "express";
import { and, count, eq, gte, sql } from "drizzle-orm";
import type { AdminStats } from "@meditime/shared";
import { db } from "../db/index.js";
import { medicineLogs, medicines, user } from "../db/schema.js";
import { requireAdmin, requireAuth } from "../middleware/requireAuth.js";

export const adminStatsRouter = Router();

adminStatsRouter.use(requireAuth, requireAdmin);

adminStatsRouter.get("/", async (_req, res) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [[totalUsers], [newUsers], [totalMeds], [activeMeds], [logStats], [recentUsers]] =
    await Promise.all([
      db.select({ n: count() }).from(user),
      db.select({ n: count() }).from(user).where(gte(user.createdAt, sevenDaysAgo)),
      db.select({ n: count() }).from(medicines),
      db.select({ n: count() }).from(medicines).where(eq(medicines.isActive, true)),
      db
        .select({
          total: count(),
          taken: sql<number>`count(*) filter (where ${medicineLogs.status} = 'taken')`,
        })
        .from(medicineLogs),
      db
        .select({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt })
        .from(user)
        .orderBy(sql`${user.createdAt} desc`)
        .limit(10),
    ]);

  const stats: AdminStats = {
    totalUsers: totalUsers.n,
    newUsersLast7Days: newUsers.n,
    totalMedicines: totalMeds.n,
    activeMedicines: activeMeds.n,
    adherenceRate: logStats.total > 0 ? Number(logStats.taken) / logStats.total : 0,
    totalDosesLogged: logStats.total,
  };

  res.json({ stats, recentUsers });
});
