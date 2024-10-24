/*
  Warnings:

  - Added the required column `type` to the `calculation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "calculation" ADD COLUMN     "type" "calculation_types" NOT NULL;
