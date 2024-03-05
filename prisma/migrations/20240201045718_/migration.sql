/*
  Warnings:

  - You are about to drop the column `category_id` on the `question` table. All the data in the column will be lost.
  - You are about to drop the column `form_id` on the `question` table. All the data in the column will be lost.
  - You are about to drop the column `textQuestionId` on the `question` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[question_id]` on the table `text_question` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `question_id` to the `text_question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "question" DROP CONSTRAINT "question_category_id_fkey";

-- DropForeignKey
ALTER TABLE "question" DROP CONSTRAINT "question_form_id_fkey";

-- DropForeignKey
ALTER TABLE "question" DROP CONSTRAINT "question_textQuestionId_fkey";

-- AlterTable
ALTER TABLE "question" DROP COLUMN "category_id",
DROP COLUMN "form_id",
DROP COLUMN "textQuestionId",
ADD COLUMN     "categoryId" INTEGER;

-- AlterTable
ALTER TABLE "text_question" ADD COLUMN     "question_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "QuestionsOnForms" (
    "formId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "QuestionsOnForms_pkey" PRIMARY KEY ("formId","questionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "text_question_question_id_key" ON "text_question"("question_id");

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "text_question" ADD CONSTRAINT "text_question_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionsOnForms" ADD CONSTRAINT "QuestionsOnForms_formId_fkey" FOREIGN KEY ("formId") REFERENCES "form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionsOnForms" ADD CONSTRAINT "QuestionsOnForms_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
