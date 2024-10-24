/*
  Warnings:

  - The values [Text,Numeric,Options Text,Options Numeric] on the enum `question_types` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `character_type` to the `question` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QuestionResponseCharacterTypes" AS ENUM ('Text', 'Numeric');

-- AlterEnum
BEGIN;
CREATE TYPE "question_types_new" AS ENUM ('Written', 'Options');
ALTER TABLE "question" ALTER COLUMN "type" TYPE "question_types_new" USING ("type"::text::"question_types_new");
ALTER TABLE "response" ALTER COLUMN "type" TYPE "question_types_new" USING ("type"::text::"question_types_new");
ALTER TYPE "question_types" RENAME TO "question_types_old";
ALTER TYPE "question_types_new" RENAME TO "question_types";
DROP TYPE "question_types_old";
COMMIT;

-- AlterTable
ALTER TABLE "question" ADD COLUMN     "character_type" "QuestionResponseCharacterTypes" NOT NULL;
