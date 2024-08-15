/*
  Warnings:

  - The values [selection] on the enum `option_types` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "option_types_new" AS ENUM ('radio', 'checkbox');
ALTER TABLE "question" ALTER COLUMN "option_type" TYPE "option_types_new" USING ("option_type"::text::"option_types_new");
ALTER TYPE "option_types" RENAME TO "option_types_old";
ALTER TYPE "option_types_new" RENAME TO "option_types";
DROP TYPE "option_types_old";
COMMIT;
