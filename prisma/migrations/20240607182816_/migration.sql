/*
  Warnings:

  - You are about to drop the column `commercial_activities_description` on the `tally` table. All the data in the column will be lost.
  - The `commercial_activities` column on the `tally` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "tally" DROP COLUMN "commercial_activities_description",
DROP COLUMN "commercial_activities",
ADD COLUMN     "commercial_activities" JSONB;
