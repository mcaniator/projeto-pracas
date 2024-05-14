/*
  Warnings:

  - You are about to drop the `text_question` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "text_question" DROP CONSTRAINT "text_question_question_id_fkey";

-- AlterTable
ALTER TABLE "question" ADD COLUMN     "char_limit" INTEGER;

-- DropTable
DROP TABLE "text_question";
