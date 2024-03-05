/*
  Warnings:

  - Made the column `groups` on table `tally` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "tally" ALTER COLUMN "groups" SET NOT NULL;
