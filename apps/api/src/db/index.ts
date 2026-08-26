import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";

if (!process.env.DATABASE_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    "[db] DATABASE_URL is not set — API will start but every DB call will fail until it's added to apps/api/.env",
  );
}

// A syntactically valid (but unreachable) placeholder so the process can still
// boot and log routes when DATABASE_URL hasn't been configured yet — real
// queries will fail with a connection error instead of crashing at startup.
const sql = neon(process.env.DATABASE_URL ?? "postgresql://user:password@localhost/meditime");

export const db = drizzle(sql, { schema });
