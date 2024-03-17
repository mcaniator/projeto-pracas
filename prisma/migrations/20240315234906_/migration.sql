/*
  Warnings:

  - Added the required column `cityId` to the `address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "address" ADD COLUMN     "cityId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
