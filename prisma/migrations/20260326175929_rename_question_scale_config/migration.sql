/*
  Warnings:

  - You are about to drop the `QuestionScaleConfig` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "QuestionScaleConfig" DROP CONSTRAINT "QuestionScaleConfig_questionId_fkey";

-- DropTable
DROP TABLE "QuestionScaleConfig";

-- CreateTable
CREATE TABLE "question_scale_config" (
    "min_value" INTEGER NOT NULL,
    "max_value" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "question_scale_config_question_id_key" ON "question_scale_config"("question_id");

-- AddForeignKey
ALTER TABLE "question_scale_config" ADD CONSTRAINT "question_scale_config_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
