import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { expo } from "@better-auth/expo";
import { db } from "./db/index.js";
import * as schema from "./db/schema.js";

const corsOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// Expo Go / dev client fetch from an "exp://<lan-ip>:<port>" origin that
// changes per machine, so it's whitelisted by pattern instead of env var.
const devOrigins =
  process.env.NODE_ENV === "production" ? [] : ["exp://", "exp://**", "exp://*.*.*.*:*/**"];

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [...corsOrigins, ...devOrigins],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
    expo(),
  ],
});

export type Auth = typeof auth;
