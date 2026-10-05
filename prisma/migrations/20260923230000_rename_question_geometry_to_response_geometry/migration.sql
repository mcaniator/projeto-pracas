BEGIN;

ALTER TABLE "question_geometry"
RENAME TO "response_geometry";

ALTER SEQUENCE "question_geometry_id_seq"
RENAME TO "response_geometry_id_seq";

ALTER TABLE "response_geometry"
ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updated_at" TIMESTAMP(3);

UPDATE "response_geometry"
SET "updated_at" = CURRENT_TIMESTAMP;

ALTER TABLE "response_geometry"
ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "response_geometry"
RENAME CONSTRAINT "question_geometry_pkey"
TO "response_geometry_pkey";

ALTER TABLE "response_geometry"
RENAME CONSTRAINT "question_geometry_question_id_fkey"
TO "response_geometry_question_id_fkey";

ALTER TABLE "response_geometry"
RENAME CONSTRAINT "question_geometry_form_submission_id_fkey"
TO "response_geometry_form_submission_id_fkey";

ALTER INDEX "question_geometry_form_submission_id_question_id_key"
RENAME TO "response_geometry_form_submission_id_question_id_key";

COMMIT;
