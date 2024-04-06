/*
  Warnings:

  - You are about to drop the column `active` on the `question` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `question` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `question` table. All the data in the column will be lost.
  - You are about to drop the column `optional` on the `question` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `question` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `question` table. All the data in the column will be lost.
  - You are about to drop the `_FormToQuestions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `answers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `numeric_question` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `option` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `options_question` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `questions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `text_question` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `classificationId` to the `question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_FormToQuestions" DROP CONSTRAINT "_FormToQuestions_A_fkey";

-- DropForeignKey
ALTER TABLE "_FormToQuestions" DROP CONSTRAINT "_FormToQuestions_B_fkey";

-- DropForeignKey
ALTER TABLE "answers" DROP CONSTRAINT "answers_classificationId_fkey";

-- DropForeignKey
ALTER TABLE "answers" DROP CONSTRAINT "answers_formId_fkey";

-- DropForeignKey
ALTER TABLE "answers" DROP CONSTRAINT "answers_locationId_fkey";

-- DropForeignKey
ALTER TABLE "answers" DROP CONSTRAINT "answers_questionId_fkey";

-- DropForeignKey
ALTER TABLE "numeric_question" DROP CONSTRAINT "numeric_question_question_id_fkey";

-- DropForeignKey
ALTER TABLE "option" DROP CONSTRAINT "option_options_question_id_fkey";

-- DropForeignKey
ALTER TABLE "options_question" DROP CONSTRAINT "options_question_question_id_fkey";

-- DropForeignKey
ALTER TABLE "question" DROP CONSTRAINT "question_category_id_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_classificationId_fkey";

-- DropForeignKey
ALTER TABLE "text_question" DROP CONSTRAINT "text_question_question_id_fkey";

-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "form_id" INTEGER;

-- AlterTable
ALTER TABLE "question" DROP COLUMN "active",
DROP COLUMN "category_id",
DROP COLUMN "created_at",
DROP COLUMN "optional",
DROP COLUMN "type",
DROP COLUMN "updated_at",
ADD COLUMN     "classificationId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_FormToQuestions";

-- DropTable
DROP TABLE "answers";

-- DropTable
DROP TABLE "category";

-- DropTable
DROP TABLE "numeric_question";

-- DropTable
DROP TABLE "option";

-- DropTable
DROP TABLE "options_question";

-- DropTable
DROP TABLE "questions";

-- DropTable
DROP TABLE "text_question";

-- CreateTable
CREATE TABLE "answer" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "formId" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,
    "classificationId" INTEGER NOT NULL,
    "content" VARCHAR(255) NOT NULL,

    CONSTRAINT "answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FormToQuestion" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ClassificationToForm" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_FormToQuestion_AB_unique" ON "_FormToQuestion"("A", "B");

-- CreateIndex
CREATE INDEX "_FormToQuestion_B_index" ON "_FormToQuestion"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ClassificationToForm_AB_unique" ON "_ClassificationToForm"("A", "B");

-- CreateIndex
CREATE INDEX "_ClassificationToForm_B_index" ON "_ClassificationToForm"("B");

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_classificationId_fkey" FOREIGN KEY ("classificationId") REFERENCES "classification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_formId_fkey" FOREIGN KEY ("formId") REFERENCES "form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_classificationId_fkey" FOREIGN KEY ("classificationId") REFERENCES "classification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "form"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FormToQuestion" ADD CONSTRAINT "_FormToQuestion_A_fkey" FOREIGN KEY ("A") REFERENCES "form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FormToQuestion" ADD CONSTRAINT "_FormToQuestion_B_fkey" FOREIGN KEY ("B") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassificationToForm" ADD CONSTRAINT "_ClassificationToForm_A_fkey" FOREIGN KEY ("A") REFERENCES "classification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassificationToForm" ADD CONSTRAINT "_ClassificationToForm_B_fkey" FOREIGN KEY ("B") REFERENCES "form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
