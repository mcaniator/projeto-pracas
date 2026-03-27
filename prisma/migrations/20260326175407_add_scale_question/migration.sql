-- AlterEnum
ALTER TYPE "question_response_character_types" ADD VALUE IF NOT EXISTS 'SCALE';

-- CreateTable
CREATE TABLE "QuestionScaleConfig" (
    "minValue" INTEGER NOT NULL,
    "maxValue" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "QuestionScaleConfig_questionId_key" ON "QuestionScaleConfig"("questionId");

-- AddForeignKey
ALTER TABLE "QuestionScaleConfig" ADD CONSTRAINT "QuestionScaleConfig_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
