import "dotenv/config";
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import { medicinesRouter } from "./routes/medicines.js";
import { logsRouter } from "./routes/logs.js";
import { adminStatsRouter } from "./routes/adminStats.js";
import { soundsRouter } from "./routes/sounds.js";
import { apiLimiter, authLimiter, uploadLimiter } from "./middleware/rateLimit.js";
import { SOUNDS_DIR } from "./lib/uploads.js";

const app = express();

// Required for correct client IPs (and therefore correct rate limiting) when
// deployed behind a reverse proxy / load balancer (Render, Railway, Fly, etc.).
if (process.env.TRUST_PROXY) {
  app.set("trust proxy", process.env.TRUST_PROXY);
}

const corsOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
  }),
);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Better Auth handles its own body parsing — must be mounted before express.json().
app.use("/api/auth", authLimiter);
app.all("/api/auth/*", toNodeHandler(auth));

// Uploaded sound files are streamed directly by URL (the OS notification/
// audio player fetching them has no session cookie), so this is public.
app.use("/uploads/sounds", express.static(SOUNDS_DIR));

app.use(express.json());
app.use("/api", apiLimiter);
app.use("/api/sounds", uploadLimiter);

app.use("/api/medicines", medicinesRouter);
app.use("/api/logs", logsRouter);
app.use("/api/admin/stats", adminStatsRouter);
app.use("/api/sounds", soundsRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[api] MediTime API listening on http://localhost:${port}`);
  if (!process.env.DATABASE_URL) {
    // eslint-disable-next-line no-console
    console.warn("[api] Reminder: DATABASE_URL / BETTER_AUTH_SECRET are not set yet (see .env.example)");
  }
});
