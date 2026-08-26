import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    "[db] DATABASE_URL is not set — API will start but every DB call will fail until it's added to apps/api/.env",
  );
}

export const prisma = new PrismaClient();
