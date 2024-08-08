/*
  Warnings:

  - You are about to drop the column `frequency` on the `response` table. All the data in the column will be lost.
  - You are about to drop the `responseOption` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "responseOption" DROP CONSTRAINT "responseOption_form_id_fkey";

-- DropForeignKey
ALTER TABLE "responseOption" DROP CONSTRAINT "responseOption_location_id_fkey";

-- DropForeignKey
ALTER TABLE "responseOption" DROP CONSTRAINT "responseOption_option_id_fkey";

-- DropForeignKey
ALTER TABLE "responseOption" DROP CONSTRAINT "responseOption_question_id_fkey";

-- AlterTable
ALTER TABLE "response" DROP COLUMN "frequency";

-- DropTable
DROP TABLE "responseOption";

-- CreateTable
CREATE TABLE "response_option" (
    "id" SERIAL NOT NULL,
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "location_id" INTEGER NOT NULL,
    "form_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "option_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "response_option_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "response_option" ADD CONSTRAINT "response_option_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_option" ADD CONSTRAINT "response_option_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_option" ADD CONSTRAINT "response_option_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_option" ADD CONSTRAINT "response_option_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "option"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
