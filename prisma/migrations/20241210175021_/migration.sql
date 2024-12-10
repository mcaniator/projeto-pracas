/*
  Warnings:

  - You are about to drop the column `active` on the `question` table. All the data in the column will be lost.
  - You are about to drop the column `char_limit` on the `question` table. All the data in the column will be lost.
  - You are about to drop the column `optional` on the `question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "question" DROP COLUMN "active",
DROP COLUMN "char_limit",
DROP COLUMN "optional";
