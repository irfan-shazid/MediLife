import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { expo } from "@better-auth/expo";
import { prisma } from "./db/prisma.js";

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
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // No verification/reset emails are wired up yet (no email provider
    // configured), so don't gate sign-in on a step that can never complete.
    requireEmailVerification: false,
  },
  // Only registered once real credentials are supplied — an empty
  // clientId/clientSecret pair makes better-auth throw at startup.
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        },
      }
    : {}),
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
    expo(),
  ],
});

export type Auth = typeof auth;
