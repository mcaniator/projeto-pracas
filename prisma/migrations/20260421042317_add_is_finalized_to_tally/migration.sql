-- AlterTable
ALTER TABLE "tally" ADD COLUMN     "is_finalized" BOOLEAN NOT NULL DEFAULT false;

UPDATE "tally"
SET "is_finalized" = true
WHERE "end_date" IS NOT NULL;
