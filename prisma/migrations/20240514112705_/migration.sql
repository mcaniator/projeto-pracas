/*
  Warnings:

  - You are about to drop the `numeric_question` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "numeric_question" DROP CONSTRAINT "numeric_question_question_id_fkey";

-- AlterTable
ALTER TABLE "question" ADD COLUMN     "maxValue" INTEGER,
ADD COLUMN     "minValue" INTEGER;

-- DropTable
DROP TABLE "numeric_question";
