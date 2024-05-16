/*
  Warnings:

  - You are about to drop the `options_question` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `option_type` to the `question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "option" DROP CONSTRAINT "option_options_question_id_fkey";

-- DropForeignKey
ALTER TABLE "options_question" DROP CONSTRAINT "options_question_question_id_fkey";

-- AlterTable
ALTER TABLE "question" ADD COLUMN     "maximum_selections" INTEGER,
ADD COLUMN     "option_type" "option_types" NOT NULL;

-- DropTable
DROP TABLE "options_question";

-- AddForeignKey
ALTER TABLE "option" ADD CONSTRAINT "option_options_question_id_fkey" FOREIGN KEY ("options_question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
