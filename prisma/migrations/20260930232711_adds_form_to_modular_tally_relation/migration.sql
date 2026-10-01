/*
  Warnings:

  - A unique constraint covering the columns `[form_submission_id,form_id]` on the table `modular_tally` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "modular_tally" ADD COLUMN     "form_id" INTEGER,
ADD COLUMN     "form_submission_id" INTEGER;

-- CreateIndex
CREATE INDEX "assessment_userId_idx" ON "assessment"("userId");

-- CreateIndex
CREATE INDEX "assessment_location_id_idx" ON "assessment"("location_id");

-- CreateIndex
CREATE INDEX "assessment_form_id_idx" ON "assessment"("form_id");

-- CreateIndex
CREATE UNIQUE INDEX "modular_tally_form_submission_id_form_id_key" ON "modular_tally"("form_submission_id", "form_id");

-- AddForeignKey
ALTER TABLE "modular_tally" ADD CONSTRAINT "modular_tally_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "form"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modular_tally" ADD CONSTRAINT "modular_tally_form_submission_id_form_id_fkey" FOREIGN KEY ("form_submission_id", "form_id") REFERENCES "form_submission"("id", "form_id") ON DELETE SET NULL ON UPDATE CASCADE;
