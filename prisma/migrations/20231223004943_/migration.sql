-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "optional" BOOLEAN NOT NULL DEFAULT false;
