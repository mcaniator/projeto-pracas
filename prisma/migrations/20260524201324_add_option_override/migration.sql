/*
  Warnings:

  - Added the required column `is_overridable` to the `option` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "option" ADD COLUMN     "is_overridable" BOOLEAN;
UPDATE "option" SET "is_overridable" = false;
ALTER TABLE "option" ALTER COLUMN "is_overridable" SET NOT NULL;

-- AlterTable
ALTER TABLE "response_option" ADD COLUMN     "override_value" VARCHAR(255);
