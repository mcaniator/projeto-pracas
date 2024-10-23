/*
  Warnings:

  - You are about to drop the `questions_on_forms` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "questions_on_forms" DROP CONSTRAINT "questions_on_forms_form_id_fkey";

-- DropForeignKey
ALTER TABLE "questions_on_forms" DROP CONSTRAINT "questions_on_forms_question_id_fkey";

-- DropTable
DROP TABLE "questions_on_forms";

-- CreateTable
CREATE TABLE "_FormToQuestion" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_FormToQuestion_AB_unique" ON "_FormToQuestion"("A", "B");

-- CreateIndex
CREATE INDEX "_FormToQuestion_B_index" ON "_FormToQuestion"("B");

-- AddForeignKey
ALTER TABLE "_FormToQuestion" ADD CONSTRAINT "_FormToQuestion_A_fkey" FOREIGN KEY ("A") REFERENCES "form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FormToQuestion" ADD CONSTRAINT "_FormToQuestion_B_fkey" FOREIGN KEY ("B") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
