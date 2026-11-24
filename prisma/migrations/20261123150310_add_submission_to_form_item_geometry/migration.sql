/*
  Warnings:

  - Added the required column `form_submission_id` to the `form_item_geometry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "form_item_geometry" ADD COLUMN     "form_submission_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "form_item_geometry" ADD CONSTRAINT "form_item_geometry_form_submission_id_fkey" FOREIGN KEY ("form_submission_id") REFERENCES "form_submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
