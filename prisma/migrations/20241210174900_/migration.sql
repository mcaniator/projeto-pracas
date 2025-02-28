-- DropForeignKey
ALTER TABLE "option" DROP CONSTRAINT "option_question_id_fkey";

-- AddForeignKey
ALTER TABLE "option" ADD CONSTRAINT "option_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
