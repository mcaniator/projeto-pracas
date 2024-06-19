/*
  Warnings:

  - You are about to drop the column `date` on the `tally` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `tally` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `tally` table. All the data in the column will be lost.
  - The `weather_condition` column on the `tally` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `observer` to the `tally` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `tally` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "weather_conditions" AS ENUM ('cloudy', 'sunny');

-- AlterTable
ALTER TABLE "tally" DROP COLUMN "date",
DROP COLUMN "endDate",
DROP COLUMN "startDate",
ADD COLUMN     "commercial_activities" INTEGER,
ADD COLUMN     "commercial_activities_description" VARCHAR(255),
ADD COLUMN     "end_date" TIMESTAMPTZ(0),
ADD COLUMN     "groups" INTEGER,
ADD COLUMN     "observer" VARCHAR(255) NOT NULL,
ADD COLUMN     "start_date" TIMESTAMPTZ(0) NOT NULL,
DROP COLUMN "weather_condition",
ADD COLUMN     "weather_condition" "weather_conditions",
ALTER COLUMN "updated_at" DROP NOT NULL;
