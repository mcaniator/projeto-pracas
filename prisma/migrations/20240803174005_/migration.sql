/*
  Warnings:

  - You are about to drop the column `assessment_id` on the `user` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_assessment_id_fkey";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "assessment_id";
