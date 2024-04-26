/*
  Warnings:

  - Made the column `startDate` on table `tally` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "tally" ALTER COLUMN "startDate" SET NOT NULL;
