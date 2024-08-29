-- DropForeignKey
ALTER TABLE "response" DROP CONSTRAINT "response_assessment_id_fkey";

-- DropForeignKey
ALTER TABLE "response_option" DROP CONSTRAINT "response_option_assessment_id_fkey";

-- AddForeignKey
ALTER TABLE "response" ADD CONSTRAINT "response_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_option" ADD CONSTRAINT "response_option_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
