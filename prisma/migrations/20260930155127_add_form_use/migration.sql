BEGIN;

-- CreateEnum
CREATE TYPE "FORM_USE" AS ENUM ('ASSESSMENT', 'TALLY_AND_BEHAVIORAL_MAP');

-- AlterTable
ALTER TABLE "category" ADD COLUMN "form_use" "FORM_USE";

-- AlterTable
ALTER TABLE "form" ADD COLUMN "form_use" "FORM_USE";

-- AlterTable
ALTER TABLE "subcategory" ADD COLUMN "form_use" "FORM_USE";

-- AlterTable
ALTER TABLE "question" ADD COLUMN "form_use" "FORM_USE";

-- Existing forms, categories, subcategories and questions are used by assessments
UPDATE "category" SET "form_use" = 'ASSESSMENT';
UPDATE "form" SET "form_use" = 'ASSESSMENT';
UPDATE "subcategory" SET "form_use" = 'ASSESSMENT';
UPDATE "question" SET "form_use" = 'ASSESSMENT';

-- Make the columns required after populating existing rows
ALTER TABLE "category" ALTER COLUMN "form_use" SET NOT NULL;
ALTER TABLE "form" ALTER COLUMN "form_use" SET NOT NULL;
ALTER TABLE "subcategory" ALTER COLUMN "form_use" SET NOT NULL;
ALTER TABLE "question" ALTER COLUMN "form_use" SET NOT NULL;

-- Replace global/category uniqueness with form-use-scoped uniqueness
DROP INDEX "category_name_key";
DROP INDEX "subcategory_category_id_name_key";
DROP INDEX "question_name_category_id_subcategory_id_key";

CREATE UNIQUE INDEX "category_form_use_name_key"
ON "category"("form_use", "name");

CREATE UNIQUE INDEX "subcategory_form_use_category_id_name_key"
ON "subcategory"("form_use", "category_id", "name");

CREATE UNIQUE INDEX "question_form_use_name_category_id_subcategory_id_key"
ON "question"("form_use", "name", "category_id", "subcategory_id");

COMMIT;
