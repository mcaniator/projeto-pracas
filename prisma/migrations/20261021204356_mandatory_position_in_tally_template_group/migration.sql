/*
  Warnings:

  - Made the column `position` on table `tally_template_group` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "tally_template_group" ALTER COLUMN "position" SET NOT NULL;
