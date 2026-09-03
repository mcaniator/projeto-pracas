-- AlterTable
ALTER TABLE "question" ADD COLUMN "max_value" DOUBLE PRECISION,
ADD COLUMN "min_value" DOUBLE PRECISION;

-- Copy scale bounds before removing their separate configuration table.
UPDATE "question"
SET
  "min_value" = "question_scale_config"."min_value",
  "max_value" = "question_scale_config"."max_value"
FROM "question_scale_config"
WHERE question."id" = "question_scale_config"."question_id";


-- DropForeignKey
ALTER TABLE "question_scale_config" DROP CONSTRAINT "question_scale_config_question_id_fkey";

-- DropTable
DROP TABLE "question_scale_config";
