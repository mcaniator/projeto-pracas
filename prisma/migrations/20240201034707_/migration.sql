/*
  Warnings:

  - You are about to drop the column `question_id` on the `text_question` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "text_question" DROP CONSTRAINT "text_question_question_id_fkey";

-- DropIndex
DROP INDEX "text_question_question_id_key";

-- AlterTable
ALTER TABLE "question" ADD COLUMN     "textQuestionId" INTEGER;

-- AlterTable
ALTER TABLE "text_question" DROP COLUMN "question_id";

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_textQuestionId_fkey" FOREIGN KEY ("textQuestionId") REFERENCES "text_question"("id") ON DELETE SET NULL ON UPDATE CASCADE;
