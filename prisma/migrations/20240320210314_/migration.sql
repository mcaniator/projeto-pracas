/*
  Warnings:

  - Added the required column `response` to the `response` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "response" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "response" VARCHAR(255) NOT NULL;
