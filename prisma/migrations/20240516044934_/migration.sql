/*
  Warnings:

  - You are about to drop the column `options_question_id` on the `option` table. All the data in the column will be lost.
  - Added the required column `question_id` to the `option` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "option" DROP CONSTRAINT "option_options_question_id_fkey";

-- AlterTable
ALTER TABLE "option" DROP COLUMN "options_question_id",
ADD COLUMN     "question_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "option" ADD CONSTRAINT "option_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
