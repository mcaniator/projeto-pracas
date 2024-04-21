/*
  Warnings:

  - The values [Open Space for non-Collective Use] on the enum `category_types` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "category_types_new" AS ENUM ('for Social Practices', 'Open Space for Collective Use in Restricted Area');
ALTER TABLE "location" ALTER COLUMN "category" TYPE "category_types_new" USING ("category"::text::"category_types_new");
ALTER TYPE "category_types" RENAME TO "category_types_old";
ALTER TYPE "category_types_new" RENAME TO "category_types";
DROP TYPE "category_types_old";
COMMIT;
