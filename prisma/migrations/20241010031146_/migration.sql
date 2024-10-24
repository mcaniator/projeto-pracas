/*
  Warnings:

  - You are about to drop the column `geometryType` on the `question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "question" DROP COLUMN "geometryType",
ADD COLUMN     "geometryTypes" "QuestionGeometryTypes"[],
ALTER COLUMN "has_associated_geometry" DROP NOT NULL;
