/*
  Warnings:

  - The values [Numeric] on the enum `QuestionResponseCharacterTypes` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "QuestionResponseCharacterTypes_new" AS ENUM ('Text', 'Number');
ALTER TABLE "question" ALTER COLUMN "character_type" TYPE "QuestionResponseCharacterTypes_new" USING ("character_type"::text::"QuestionResponseCharacterTypes_new");
ALTER TYPE "QuestionResponseCharacterTypes" RENAME TO "QuestionResponseCharacterTypes_old";
ALTER TYPE "QuestionResponseCharacterTypes_new" RENAME TO "QuestionResponseCharacterTypes";
DROP TYPE "QuestionResponseCharacterTypes_old";
COMMIT;
