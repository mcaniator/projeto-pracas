/*
  Warnings:

  - Added the required column `type` to the `response` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "response" ADD COLUMN     "type" "question_types" NOT NULL;
