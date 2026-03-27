-- AlterTable
ALTER TABLE "assessment" ADD COLUMN     "is_public" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "tally" ADD COLUMN     "is_public" BOOLEAN NOT NULL DEFAULT false;
