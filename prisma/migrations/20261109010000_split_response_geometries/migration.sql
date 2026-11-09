BEGIN;

DELETE FROM "response_geometry";

DROP INDEX "response_geometry_form_submission_id_question_id_key";

CREATE INDEX "response_geometry_form_submission_id_id_idx"
ON "response_geometry"("form_submission_id", "id");

COMMIT;
