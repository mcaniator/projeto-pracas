/*
  Warnings:

  - A unique constraint covering the columns `[main_assessment_id]` on the table `location` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "location" ADD COLUMN     "main_assessment_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "location_main_assessment_id_key" ON "location"("main_assessment_id");

-- AddForeignKey
ALTER TABLE "location" ADD CONSTRAINT "location_main_assessment_id_fkey" FOREIGN KEY ("main_assessment_id") REFERENCES "assessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
