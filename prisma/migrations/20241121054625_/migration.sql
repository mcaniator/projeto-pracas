-- AlterTable
ALTER TABLE "location" ADD COLUMN     "cityId" INTEGER;

-- AddForeignKey
ALTER TABLE "location" ADD CONSTRAINT "location_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE SET NULL ON UPDATE CASCADE;
