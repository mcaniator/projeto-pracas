/*
  Warnings:

  - You are about to drop the `image_response` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "image_response" DROP CONSTRAINT "image_response_assessment_id_fkey";

-- DropForeignKey
ALTER TABLE "image_response" DROP CONSTRAINT "image_response_image_id_fkey";

-- DropForeignKey
ALTER TABLE "image_response" DROP CONSTRAINT "image_response_question_id_fkey";

-- DropTable
DROP TABLE "image_response";
