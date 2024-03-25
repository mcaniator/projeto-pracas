/*
  Warnings:

  - You are about to drop the column `locationId` on the `response` table. All the data in the column will be lost.
  - Added the required column `location_id` to the `response` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "response" DROP CONSTRAINT "response_locationId_fkey";

-- AlterTable
ALTER TABLE "response" DROP COLUMN "locationId",
ADD COLUMN     "location_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "response" ADD CONSTRAINT "response_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
