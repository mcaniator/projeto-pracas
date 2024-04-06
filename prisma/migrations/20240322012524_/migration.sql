/*
  Warnings:

  - You are about to drop the column `answerId` on the `Classification` table. All the data in the column will be lost.
  - You are about to drop the column `questionId` on the `Classification` table. All the data in the column will be lost.
  - Added the required column `classifitacionId` to the `Answers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `classifitacionId` to the `Questions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Classification" DROP CONSTRAINT "Classification_answerId_fkey";

-- DropForeignKey
ALTER TABLE "Classification" DROP CONSTRAINT "Classification_questionId_fkey";

-- DropIndex
DROP INDEX "Classification_answerId_key";

-- DropIndex
DROP INDEX "Classification_questionId_key";

-- AlterTable
ALTER TABLE "Answers" ADD COLUMN     "classifitacionId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Classification" DROP COLUMN "answerId",
DROP COLUMN "questionId";

-- AlterTable
ALTER TABLE "Questions" ADD COLUMN     "classifitacionId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Questions" ADD CONSTRAINT "Questions_classifitacionId_fkey" FOREIGN KEY ("classifitacionId") REFERENCES "Classification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answers" ADD CONSTRAINT "Answers_classifitacionId_fkey" FOREIGN KEY ("classifitacionId") REFERENCES "Classification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
