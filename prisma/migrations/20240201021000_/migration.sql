/*
  Warnings:

  - Added the required column `form_id` to the `question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "question" ADD COLUMN     "form_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
