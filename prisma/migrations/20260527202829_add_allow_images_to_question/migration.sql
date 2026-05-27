-- AlterTable
ALTER TABLE "question" ADD COLUMN     "allow_images" BOOLEAN;
UPDATE "question" SET "allow_images" = false;
ALTER TABLE "question" ALTER COLUMN "allow_images" SET NOT NULL;
