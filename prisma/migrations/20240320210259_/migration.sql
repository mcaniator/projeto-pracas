/*
  Warnings:

  - You are about to drop the column `created_at` on the `response` table. All the data in the column will be lost.
  - You are about to drop the column `response` on the `response` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "response" DROP COLUMN "created_at",
DROP COLUMN "response";
