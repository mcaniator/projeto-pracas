/*
  Warnings:

  - A unique constraint covering the columns `[questionId,assessmentId]` on the table `answer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "answer_questionId_assessmentId_key" ON "answer"("questionId", "assessmentId");
