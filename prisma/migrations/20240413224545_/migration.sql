/*
  Warnings:

  - Made the column `tally_group` on table `tally` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "tally" ALTER COLUMN "tally_group" SET NOT NULL;
