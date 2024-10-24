/*
  Warnings:

  - A unique constraint covering the columns `[assessment_id,question_id]` on the table `response` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "response_assessment_id_question_id_key" ON "response"("assessment_id", "question_id");
