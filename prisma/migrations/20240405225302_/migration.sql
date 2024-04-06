/*
  Warnings:

  - You are about to drop the column `artwork_amount` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `artwork_condition` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `bathroom_amount` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `bathroom_condition` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `changed_delimitation` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `drinking_fountain_amount` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `drinking_fountain_condition` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `has_wifi` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `movable_seats_amount` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `movable_seats_condition` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `paved_sidewalk` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `payphone_amount` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `payphone_condition` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `planned_landscaping_amount` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `planned_landscaping_condition` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `sidewalk_condition` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `trash_can_amount` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `trash_can_condition` on the `Assessment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Assessment" DROP COLUMN "artwork_amount",
DROP COLUMN "artwork_condition",
DROP COLUMN "bathroom_amount",
DROP COLUMN "bathroom_condition",
DROP COLUMN "changed_delimitation",
DROP COLUMN "drinking_fountain_amount",
DROP COLUMN "drinking_fountain_condition",
DROP COLUMN "has_wifi",
DROP COLUMN "movable_seats_amount",
DROP COLUMN "movable_seats_condition",
DROP COLUMN "paved_sidewalk",
DROP COLUMN "payphone_amount",
DROP COLUMN "payphone_condition",
DROP COLUMN "planned_landscaping_amount",
DROP COLUMN "planned_landscaping_condition",
DROP COLUMN "sidewalk_condition",
DROP COLUMN "trash_can_amount",
DROP COLUMN "trash_can_condition";
