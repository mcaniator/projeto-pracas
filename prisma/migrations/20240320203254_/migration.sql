/*
  Warnings:

  - You are about to drop the column `question_id` on the `response` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "response" DROP CONSTRAINT "response_question_id_fkey";

-- AlterTable
ALTER TABLE "response" DROP COLUMN "question_id",
ADD COLUMN     "questionId" INTEGER;

-- AddForeignKey
ALTER TABLE "response" ADD CONSTRAINT "response_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE SET NULL ON UPDATE CASCADE;
