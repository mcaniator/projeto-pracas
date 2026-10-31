/*
  Warnings:

  - You are about to drop the column `creation_year` on the `location` table. All the data in the column will be lost.
  - You are about to drop the column `incline` on the `location` table. All the data in the column will be lost.
  - You are about to drop the column `last_maintenance_year` on the `location` table. All the data in the column will be lost.
  - You are about to drop the column `legal_area` on the `location` table. All the data in the column will be lost.
  - You are about to drop the column `legislation` on the `location` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `location` table. All the data in the column will be lost.
  - You are about to drop the column `usable_area` on the `location` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[form_submission_id]` on the table `location` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "FORM_USE" ADD VALUE 'LOCATION';

-- Clear values from legacy location fields before removing their columns.
UPDATE "location"
SET
    "creation_year" = NULL,
    "incline" = NULL,
    "last_maintenance_year" = NULL,
    "legal_area" = NULL,
    "legislation" = NULL,
    "notes" = NULL,
    "usable_area" = NULL;

-- AlterTable
ALTER TABLE "location" DROP COLUMN "creation_year",
DROP COLUMN "incline",
DROP COLUMN "last_maintenance_year",
DROP COLUMN "legal_area",
DROP COLUMN "legislation",
DROP COLUMN "notes",
DROP COLUMN "usable_area",
ADD COLUMN     "form_submission_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "location_form_submission_id_key" ON "location"("form_submission_id");

-- AddForeignKey
ALTER TABLE "location" ADD CONSTRAINT "location_form_submission_id_fkey" FOREIGN KEY ("form_submission_id") REFERENCES "form_submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
