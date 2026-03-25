/*
  Warnings:

  - You are about to drop the column `main_assessment_id` on the `location` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "location" DROP CONSTRAINT "location_main_assessment_id_fkey";

-- DropIndex
DROP INDEX "location_main_assessment_id_key";

-- AlterTable
ALTER TABLE "location" DROP COLUMN "main_assessment_id";
