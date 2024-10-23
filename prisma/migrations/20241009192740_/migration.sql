-- CreateEnum
CREATE TYPE "QuestionGeometryTypes" AS ENUM ('Point', 'Polygon', 'Multipolygon');

-- AlterTable
ALTER TABLE "question" ADD COLUMN     "geometryType" "QuestionGeometryTypes"[];
