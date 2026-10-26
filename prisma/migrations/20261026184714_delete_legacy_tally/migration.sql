/*
  Warnings:

  - You are about to drop the `tally` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "tally" DROP CONSTRAINT "tally_location_id_fkey";

-- DropForeignKey
ALTER TABLE "tally" DROP CONSTRAINT "tally_user_id_fkey";

-- DropTable
DROP TABLE "tally";

-- DropEnum
DROP TYPE "weather_conditions";
