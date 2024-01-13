/*
  Warnings:

  - A unique constraint covering the columns `[cityId,administrative_delimitation_1_name]` on the table `administrative_delimitation_1` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cityId,administrative_delimitation_2_name]` on the table `administrative_delimitation_2` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cityId,administrative_delimitation_3_name]` on the table `administrative_delimitation_3` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "administrative_delimitation_1_cityId_administrative_delimit_key" ON "administrative_delimitation_1"("cityId", "administrative_delimitation_1_name");

-- CreateIndex
CREATE UNIQUE INDEX "administrative_delimitation_2_cityId_administrative_delimit_key" ON "administrative_delimitation_2"("cityId", "administrative_delimitation_2_name");

-- CreateIndex
CREATE UNIQUE INDEX "administrative_delimitation_3_cityId_administrative_delimit_key" ON "administrative_delimitation_3"("cityId", "administrative_delimitation_3_name");
