/*
  Warnings:

  - You are about to drop the column `classifitacionId` on the `Answers` table. All the data in the column will be lost.
  - You are about to drop the column `classifitacionId` on the `Questions` table. All the data in the column will be lost.
  - Added the required column `classificationId` to the `Answers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `classificationId` to the `Questions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Answers" DROP CONSTRAINT "Answers_classifitacionId_fkey";

-- DropForeignKey
ALTER TABLE "Questions" DROP CONSTRAINT "Questions_classifitacionId_fkey";

-- AlterTable
ALTER TABLE "Answers" DROP COLUMN "classifitacionId",
ADD COLUMN     "classificationId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Questions" DROP COLUMN "classifitacionId",
ADD COLUMN     "classificationId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Questions" ADD CONSTRAINT "Questions_classificationId_fkey" FOREIGN KEY ("classificationId") REFERENCES "Classification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answers" ADD CONSTRAINT "Answers_classificationId_fkey" FOREIGN KEY ("classificationId") REFERENCES "Classification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
