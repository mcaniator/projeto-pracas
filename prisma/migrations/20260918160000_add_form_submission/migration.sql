BEGIN;

-- CreateTable
CREATE TABLE "form_submission" (
    "id" SERIAL NOT NULL,
    "form_id" INTEGER NOT NULL,
    "migration_assessment_id" INTEGER,

    CONSTRAINT "form_submission_pkey" PRIMARY KEY ("id")
);

-- Add the new relation columns as nullable so existing data can be migrated.
ALTER TABLE "assessment" ADD COLUMN "form_submission_id" INTEGER;
ALTER TABLE "response" ADD COLUMN "form_submission_id" INTEGER;
ALTER TABLE "response_option" ADD COLUMN "form_submission_id" INTEGER;
ALTER TABLE "question_geometry" ADD COLUMN "form_submission_id" INTEGER;

-- Create one form submission for every existing assessment. The temporary
-- assessment id keeps the association while the submission id is generated
-- by its own sequence.
INSERT INTO "form_submission" ("form_id", "migration_assessment_id")
SELECT "form_id", "id"
FROM "assessment";

UPDATE "assessment" AS assessment
SET "form_submission_id" = form_submission."id"
FROM "form_submission" AS form_submission
WHERE form_submission."migration_assessment_id" = assessment."id";

UPDATE "response" AS response
SET "form_submission_id" = assessment."form_submission_id"
FROM "assessment" AS assessment
WHERE response."assessment_id" = assessment."id";

UPDATE "response_option" AS response_option
SET "form_submission_id" = assessment."form_submission_id"
FROM "assessment" AS assessment
WHERE response_option."assessment_id" = assessment."id";

UPDATE "question_geometry" AS question_geometry
SET "form_submission_id" = assessment."form_submission_id"
FROM "assessment" AS assessment
WHERE question_geometry."assessment_id" = assessment."id";

-- The temporary association is no longer needed after all related records
-- have been migrated.
ALTER TABLE "form_submission" DROP COLUMN "migration_assessment_id";

-- DropForeignKey
ALTER TABLE "response" DROP CONSTRAINT "response_assessment_id_fkey";

-- DropForeignKey
ALTER TABLE "response_option" DROP CONSTRAINT "response_option_assessment_id_fkey";

-- DropForeignKey
ALTER TABLE "question_geometry" DROP CONSTRAINT "question_geometry_assessment_id_fkey";

-- DropIndex
DROP INDEX "response_assessment_id_question_id_key";

-- DropIndex
DROP INDEX "question_geometry_assessment_id_question_id_key";

-- DropColumn
ALTER TABLE "response" DROP COLUMN "assessment_id";

-- DropColumn
ALTER TABLE "response_option" DROP COLUMN "assessment_id";

-- DropColumn
ALTER TABLE "question_geometry" DROP COLUMN "assessment_id";

-- Make the backfilled relations mandatory.
ALTER TABLE "assessment" ALTER COLUMN "form_submission_id" SET NOT NULL;
ALTER TABLE "response" ALTER COLUMN "form_submission_id" SET NOT NULL;
ALTER TABLE "response_option" ALTER COLUMN "form_submission_id" SET NOT NULL;
ALTER TABLE "question_geometry" ALTER COLUMN "form_submission_id" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "assessment_form_submission_id_form_id_key"
ON "assessment"("form_submission_id", "form_id");

-- CreateIndex
CREATE INDEX "form_submission_form_id_idx"
ON "form_submission"("form_id");

-- CreateIndex
CREATE UNIQUE INDEX "form_submission_id_form_id_key"
ON "form_submission"("id", "form_id");

-- CreateIndex
CREATE UNIQUE INDEX "response_form_submission_id_question_id_key"
ON "response"("form_submission_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "question_geometry_form_submission_id_question_id_key"
ON "question_geometry"("form_submission_id", "question_id");

-- AddForeignKey
ALTER TABLE "form_submission"
ADD CONSTRAINT "form_submission_form_id_fkey"
FOREIGN KEY ("form_id") REFERENCES "form"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment"
ADD CONSTRAINT "assessment_form_submission_id_form_id_fkey"
FOREIGN KEY ("form_submission_id", "form_id") REFERENCES "form_submission"("id", "form_id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response"
ADD CONSTRAINT "response_form_submission_id_fkey"
FOREIGN KEY ("form_submission_id") REFERENCES "form_submission"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_option"
ADD CONSTRAINT "response_option_form_submission_id_fkey"
FOREIGN KEY ("form_submission_id") REFERENCES "form_submission"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_geometry"
ADD CONSTRAINT "question_geometry_form_submission_id_fkey"
FOREIGN KEY ("form_submission_id") REFERENCES "form_submission"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
