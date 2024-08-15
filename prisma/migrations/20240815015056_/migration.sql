-- DropForeignKey
ALTER TABLE "response_option" DROP CONSTRAINT "response_option_option_id_fkey";

-- AlterTable
ALTER TABLE "response_option" ALTER COLUMN "option_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "response_option" ADD CONSTRAINT "response_option_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "option"("id") ON DELETE SET NULL ON UPDATE CASCADE;
