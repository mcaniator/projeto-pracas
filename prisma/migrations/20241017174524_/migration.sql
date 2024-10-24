/*
  Warnings:

  - You are about to drop the column `assessmentId` on the `question_geometry` table. All the data in the column will be lost.
  - You are about to drop the column `questionId` on the `question_geometry` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[assessment_id,question_id]` on the table `question_geometry` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `assessment_id` to the `question_geometry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `question_id` to the `question_geometry` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "question_geometry" DROP CONSTRAINT "question_geometry_assessmentId_fkey";

-- DropForeignKey
ALTER TABLE "question_geometry" DROP CONSTRAINT "question_geometry_questionId_fkey";

-- DropIndex
DROP INDEX "question_geometry_assessmentId_questionId_key";

-- AlterTable
ALTER TABLE "question_geometry" DROP COLUMN "assessmentId",
DROP COLUMN "questionId",
ADD COLUMN     "assessment_id" INTEGER NOT NULL,
ADD COLUMN     "question_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "question_geometry_assessment_id_question_id_key" ON "question_geometry"("assessment_id", "question_id");

-- AddForeignKey
ALTER TABLE "question_geometry" ADD CONSTRAINT "question_geometry_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_geometry" ADD CONSTRAINT "question_geometry_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
