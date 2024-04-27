/*
  Warnings:

  - The values [Central and Large Flowerbeds,Court Edges,Fenced Park,Unoccupied Plot,Remnants of Road Construction/Land Division,Roundabouts,Interchange] on the enum `location_types` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `accessibility` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `activities_area` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `destruction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `landscaping` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `seating` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `security` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `surrounding_activity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `surrounding_area` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `traffic_safety` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `start_date` on table `Assessment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `form_id` on table `Assessment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "location_types_new" AS ENUM ('Micro Square', 'Square', 'Sports Square', 'Overlook', 'Courtyard', 'Garden', 'Churchyard', 'Park', 'Botanical Garden', 'Forest Garden', 'Amateur Soccer Fields');
ALTER TABLE "location" ALTER COLUMN "type" TYPE "location_types_new" USING ("type"::text::"location_types_new");
ALTER TYPE "location_types" RENAME TO "location_types_old";
ALTER TYPE "location_types_new" RENAME TO "location_types";
DROP TYPE "location_types_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Assessment" DROP CONSTRAINT "Assessment_form_id_fkey";

-- DropForeignKey
ALTER TABLE "accessibility" DROP CONSTRAINT "accessibility_assessment_id_fkey";

-- DropForeignKey
ALTER TABLE "activities_area" DROP CONSTRAINT "activities_area_assessment_id_fkey";

-- DropForeignKey
ALTER TABLE "destruction" DROP CONSTRAINT "destruction_assessment_id_fkey";

-- DropForeignKey
ALTER TABLE "landscaping" DROP CONSTRAINT "landscaping_assessment_id_fkey";

-- DropForeignKey
ALTER TABLE "seating" DROP CONSTRAINT "seating_assessment_id_fkey";

-- DropForeignKey
ALTER TABLE "security" DROP CONSTRAINT "security_assessment_id_fkey";

-- DropForeignKey
ALTER TABLE "surrounding_activity" DROP CONSTRAINT "surrounding_activity_assessment_id_fkey";

-- DropForeignKey
ALTER TABLE "surrounding_area" DROP CONSTRAINT "surrounding_area_assessment_id_fkey";

-- DropForeignKey
ALTER TABLE "traffic_safety" DROP CONSTRAINT "traffic_safety_assessment_id_fkey";

-- AlterTable
ALTER TABLE "Assessment" ALTER COLUMN "start_date" SET NOT NULL,
ALTER COLUMN "form_id" SET NOT NULL;

-- DropTable
DROP TABLE "accessibility";

-- DropTable
DROP TABLE "activities_area";

-- DropTable
DROP TABLE "destruction";

-- DropTable
DROP TABLE "landscaping";

-- DropTable
DROP TABLE "seating";

-- DropTable
DROP TABLE "security";

-- DropTable
DROP TABLE "surrounding_activity";

-- DropTable
DROP TABLE "surrounding_area";

-- DropTable
DROP TABLE "traffic_safety";

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
