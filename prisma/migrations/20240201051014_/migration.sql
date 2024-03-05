/*
  Warnings:

  - The primary key for the `QuestionsOnForms` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `formId` on the `QuestionsOnForms` table. All the data in the column will be lost.
  - You are about to drop the column `questionId` on the `QuestionsOnForms` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `question` table. All the data in the column will be lost.
  - Added the required column `form_id` to the `QuestionsOnForms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `question_id` to the `QuestionsOnForms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category_id` to the `question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "QuestionsOnForms" DROP CONSTRAINT "QuestionsOnForms_formId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionsOnForms" DROP CONSTRAINT "QuestionsOnForms_questionId_fkey";

-- DropForeignKey
ALTER TABLE "question" DROP CONSTRAINT "question_categoryId_fkey";

-- AlterTable
ALTER TABLE "QuestionsOnForms" DROP CONSTRAINT "QuestionsOnForms_pkey",
DROP COLUMN "formId",
DROP COLUMN "questionId",
ADD COLUMN     "form_id" INTEGER NOT NULL,
ADD COLUMN     "question_id" INTEGER NOT NULL,
ADD CONSTRAINT "QuestionsOnForms_pkey" PRIMARY KEY ("form_id", "question_id");

-- AlterTable
ALTER TABLE "question" DROP COLUMN "categoryId",
ADD COLUMN     "category_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionsOnForms" ADD CONSTRAINT "QuestionsOnForms_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionsOnForms" ADD CONSTRAINT "QuestionsOnForms_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
