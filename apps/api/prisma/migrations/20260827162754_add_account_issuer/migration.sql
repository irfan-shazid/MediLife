-- AlterTable
ALTER TABLE "account" ADD COLUMN "issuer" TEXT;

-- Backfill: every existing row so far is a credential (email/password) account.
UPDATE "account" SET "issuer" = 'local:credential' WHERE "issuer" IS NULL;

-- AlterTable
ALTER TABLE "account" ALTER COLUMN "issuer" SET NOT NULL;
