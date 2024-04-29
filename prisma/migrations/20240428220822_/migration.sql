/*
  Warnings:

  - A unique constraint covering the columns `[id,location_id]` on the table `Assessment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Assessment_id_location_id_key" ON "Assessment"("id", "location_id");
