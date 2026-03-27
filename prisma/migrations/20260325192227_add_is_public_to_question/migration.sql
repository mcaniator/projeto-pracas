/*
  Warnings:

  - Added the required column `is_public` to the `question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "question" ADD COLUMN     "is_public" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "question" ALTER COLUMN "is_public" DROP DEFAULT;
