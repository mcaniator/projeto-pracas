/*
  Warnings:

  - You are about to drop the `QuestionGeometry` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "QuestionGeometry" DROP CONSTRAINT "QuestionGeometry_assessmentId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionGeometry" DROP CONSTRAINT "QuestionGeometry_questionId_fkey";

-- DropTable
DROP TABLE "QuestionGeometry";

-- CreateTable
CREATE TABLE "question_geometry" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "assessmentId" INTEGER NOT NULL,
    "geometry" Geometry,

    CONSTRAINT "question_geometry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "question_geometry_assessmentId_questionId_key" ON "question_geometry"("assessmentId", "questionId");

-- AddForeignKey
ALTER TABLE "question_geometry" ADD CONSTRAINT "question_geometry_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_geometry" ADD CONSTRAINT "question_geometry_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
