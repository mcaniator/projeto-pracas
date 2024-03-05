/*
  Warnings:

  - You are about to drop the `QuestionsOnForms` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "QuestionsOnForms" DROP CONSTRAINT "QuestionsOnForms_form_id_fkey";

-- DropForeignKey
ALTER TABLE "QuestionsOnForms" DROP CONSTRAINT "QuestionsOnForms_question_id_fkey";

-- DropTable
DROP TABLE "QuestionsOnForms";

-- CreateTable
CREATE TABLE "questions_on_forms" (
    "id" SERIAL NOT NULL,
    "form_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,

    CONSTRAINT "questions_on_forms_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "questions_on_forms" ADD CONSTRAINT "questions_on_forms_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions_on_forms" ADD CONSTRAINT "questions_on_forms_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
