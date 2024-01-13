/*
  Warnings:

  - You are about to drop the column `city_id` on the `address` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `noise` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `noise` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "address" DROP CONSTRAINT "address_city_id_fkey";

-- AlterTable
ALTER TABLE "address" DROP COLUMN "city_id";

-- AlterTable
ALTER TABLE "administrative_delimitation_1" ADD COLUMN     "cityId" INTEGER;

-- AlterTable
ALTER TABLE "administrative_delimitation_2" ADD COLUMN     "cityId" INTEGER;

-- AlterTable
ALTER TABLE "administrative_delimitation_3" ADD COLUMN     "cityId" INTEGER;

-- AlterTable
ALTER TABLE "noise" DROP COLUMN "latitude",
DROP COLUMN "longitude",
ADD COLUMN     "point" Point;

-- AddForeignKey
ALTER TABLE "administrative_delimitation_1" ADD CONSTRAINT "administrative_delimitation_1_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administrative_delimitation_2" ADD CONSTRAINT "administrative_delimitation_2_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administrative_delimitation_3" ADD CONSTRAINT "administrative_delimitation_3_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE SET NULL ON UPDATE CASCADE;
