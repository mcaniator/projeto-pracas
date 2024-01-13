/*
  Warnings:

  - Made the column `start_date` on table `Assessment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `end_date` on table `Assessment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `wifi` on table `Assessment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `paved_sidewalk` on table `Assessment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `trash_can_amount` on table `Assessment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bathroom_amount` on table `Assessment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `payphone_amount` on table `Assessment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `drinking_fountain_amount` on table `Assessment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `artwork_amount` on table `Assessment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `planned_landscaping_amount` on table `Assessment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `movable_seats_amount` on table `Assessment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sidewalk_condition` on table `Assessment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `trash_can_condition` on table `Assessment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bathroom_condition` on table `Assessment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `payphone_condition` on table `Assessment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `drinking_fountain_condition` on table `Assessment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `artwork_condition` on table `Assessment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `planned_landscaping_condition` on table `Assessment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `movable_seats_condition` on table `Assessment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Assessment" ALTER COLUMN "start_date" SET NOT NULL,
ALTER COLUMN "end_date" SET NOT NULL,
ALTER COLUMN "wifi" SET NOT NULL,
ALTER COLUMN "paved_sidewalk" SET NOT NULL,
ALTER COLUMN "trash_can_amount" SET NOT NULL,
ALTER COLUMN "bathroom_amount" SET NOT NULL,
ALTER COLUMN "payphone_amount" SET NOT NULL,
ALTER COLUMN "drinking_fountain_amount" SET NOT NULL,
ALTER COLUMN "artwork_amount" SET NOT NULL,
ALTER COLUMN "planned_landscaping_amount" SET NOT NULL,
ALTER COLUMN "movable_seats_amount" SET NOT NULL,
ALTER COLUMN "sidewalk_condition" SET NOT NULL,
ALTER COLUMN "trash_can_condition" SET NOT NULL,
ALTER COLUMN "bathroom_condition" SET NOT NULL,
ALTER COLUMN "payphone_condition" SET NOT NULL,
ALTER COLUMN "drinking_fountain_condition" SET NOT NULL,
ALTER COLUMN "artwork_condition" SET NOT NULL,
ALTER COLUMN "planned_landscaping_condition" SET NOT NULL,
ALTER COLUMN "movable_seats_condition" SET NOT NULL;
