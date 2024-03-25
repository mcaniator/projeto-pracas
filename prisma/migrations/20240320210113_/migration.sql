/*
  Warnings:

  - Added the required column `question_id` to the `response` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "response" ADD COLUMN     "question_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "response" ADD CONSTRAINT "response_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
