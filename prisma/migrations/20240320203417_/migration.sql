/*
  Warnings:

  - You are about to drop the column `questionId` on the `response` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "response" DROP CONSTRAINT "response_questionId_fkey";

-- AlterTable
ALTER TABLE "response" DROP COLUMN "questionId";
