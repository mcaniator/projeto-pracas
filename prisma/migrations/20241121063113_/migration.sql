/*
  Warnings:

  - Added the required column `state` to the `city` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "city" ADD COLUMN     "state" "brazilian_states" NOT NULL;
