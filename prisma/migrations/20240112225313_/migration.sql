/*
  Warnings:

  - You are about to drop the column `location_id` on the `noise` table. All the data in the column will be lost.
  - Added the required column `assesment_id` to the `noise` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "noise" DROP CONSTRAINT "noise_location_id_fkey";

-- DropIndex
DROP INDEX "noise_location_id_key";

-- AlterTable
ALTER TABLE "noise" DROP COLUMN "location_id",
ADD COLUMN     "assesment_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "noise" ADD CONSTRAINT "noise_assesment_id_fkey" FOREIGN KEY ("assesment_id") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
