/*
  Warnings:

  - You are about to drop the `_AssessmentToQuestion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AssessmentToQuestion" DROP CONSTRAINT "_AssessmentToQuestion_A_fkey";

-- DropForeignKey
ALTER TABLE "_AssessmentToQuestion" DROP CONSTRAINT "_AssessmentToQuestion_B_fkey";

-- DropTable
DROP TABLE "_AssessmentToQuestion";
