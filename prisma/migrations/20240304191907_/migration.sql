/*
  Warnings:

  - Made the column `startDate` on table `tally` required. This step will fail if there are existing NULL values in that column.
  - Made the column `endDate` on table `tally` required. This step will fail if there are existing NULL values in that column.
  - Made the column `animals_amount` on table `tally` required. This step will fail if there are existing NULL values in that column.
  - Made the column `observer` on table `tally` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "tally" ALTER COLUMN "startDate" SET NOT NULL,
ALTER COLUMN "endDate" SET NOT NULL,
ALTER COLUMN "animals_amount" SET NOT NULL,
ALTER COLUMN "observer" SET NOT NULL;
