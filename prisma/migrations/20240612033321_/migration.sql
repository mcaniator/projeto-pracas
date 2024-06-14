/*
  Warnings:

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

-- DropTable
DROP TABLE "responseOption";
