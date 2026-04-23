-- AlterTable
ALTER TABLE "assessment" ADD COLUMN     "is_finalized" BOOLEAN NOT NULL DEFAULT false;

UPDATE "assessment"
SET "is_finalized" = true
WHERE "end_date" IS NOT NULL;
