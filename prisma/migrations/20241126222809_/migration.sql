/*
  Warnings:

  - You are about to drop the column `cityId` on the `location` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "location" DROP CONSTRAINT "location_cityId_fkey";

-- AlterTable
ALTER TABLE "location" DROP COLUMN "cityId";
