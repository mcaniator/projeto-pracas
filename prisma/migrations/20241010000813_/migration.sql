/*
  Warnings:

  - The values [Multipolygon] on the enum `QuestionGeometryTypes` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "QuestionGeometryTypes_new" AS ENUM ('Point', 'Polygon');
ALTER TABLE "question" ALTER COLUMN "geometryType" TYPE "QuestionGeometryTypes_new"[] USING ("geometryType"::text::"QuestionGeometryTypes_new"[]);
ALTER TYPE "QuestionGeometryTypes" RENAME TO "QuestionGeometryTypes_old";
ALTER TYPE "QuestionGeometryTypes_new" RENAME TO "QuestionGeometryTypes";
DROP TYPE "QuestionGeometryTypes_old";
COMMIT;
