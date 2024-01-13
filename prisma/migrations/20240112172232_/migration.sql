-- DropForeignKey
ALTER TABLE "noise" DROP CONSTRAINT "noise_location_id_fkey";

-- AddForeignKey
ALTER TABLE "noise" ADD CONSTRAINT "noise_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
