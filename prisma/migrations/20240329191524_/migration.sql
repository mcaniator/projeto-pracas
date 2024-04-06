/*
  Warnings:

  - Added the required column `assessmentId` to the `answer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "answer" ADD COLUMN     "assessmentId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
