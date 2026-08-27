import "dotenv/config";
import crypto from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "../src/db/prisma.js";

// Demo/dev accounts only. These passwords deliberately bypass the app's own
// minPasswordLength (8) policy, which is enforced only at the public sign-up
// API — seeding writes the user/account rows directly, hashed the same way
// Better Auth would hash them, so they sign in normally afterward.
const SEED_USERS = [
  { email: "user@gmail.com", name: "Demo User", password: "12345", role: "user" },
  { email: "admin@gmail.com", name: "Demo Admin", password: "12345", role: "admin" },
] as const;

async function seedUser({ email, name, password, role }: (typeof SEED_USERS)[number]) {
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    update: { role },
    create: {
      id: crypto.randomUUID(),
      email,
      name,
      emailVerified: true,
      role,
    },
  });

  const existingAccount = await prisma.account.findFirst({
    where: { userId: user.id, providerId: "credential" },
  });

  if (existingAccount) {
    await prisma.account.update({
      where: { id: existingAccount.id },
      data: { password: passwordHash, issuer: "local:credential" },
    });
  } else {
    await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        accountId: user.id,
        providerId: "credential",
        issuer: "local:credential",
        password: passwordHash,
      },
    });
  }

  console.log(`Seeded ${role}: ${email} / ${password}`);
}

async function main() {
  for (const seedUserConfig of SEED_USERS) {
    await seedUser(seedUserConfig);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
