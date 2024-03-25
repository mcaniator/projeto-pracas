/*
  Warnings:

  - You are about to drop the column `location_id` on the `response` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "response" DROP CONSTRAINT "response_location_id_fkey";

-- AlterTable
ALTER TABLE "response" DROP COLUMN "location_id",
ADD COLUMN     "locationId" INTEGER;

-- AddForeignKey
ALTER TABLE "response" ADD CONSTRAINT "response_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
