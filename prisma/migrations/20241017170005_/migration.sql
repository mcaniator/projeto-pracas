/*
  Warnings:

  - You are about to drop the column `geometry` on the `response` table. All the data in the column will be lost.
  - You are about to drop the column `geometry` on the `response_option` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "response" DROP COLUMN "geometry";

-- AlterTable
ALTER TABLE "response_option" DROP COLUMN "geometry";

-- CreateTable
CREATE TABLE "QuestionGeometry" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "assessmentId" INTEGER NOT NULL,
    "geometry" Geometry,

    CONSTRAINT "QuestionGeometry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuestionGeometry_assessmentId_questionId_key" ON "QuestionGeometry"("assessmentId", "questionId");

-- AddForeignKey
ALTER TABLE "QuestionGeometry" ADD CONSTRAINT "QuestionGeometry_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionGeometry" ADD CONSTRAINT "QuestionGeometry_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
