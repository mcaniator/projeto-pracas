/*
  Warnings:

  - You are about to drop the `boolean_response` table. If the table is not empty, all the data it contains will be lost.

*/

INSERT INTO "response" ("user_id", "assessment_id","question_id","response","created_at","updated_at") SELECT "user_id", "assessment_id","question_id", CASE WHEN "checked" THEN '1' ELSE '0' END, "created_at","updated_at" FROM "boolean_response";  

-- DropForeignKey
ALTER TABLE "boolean_response" DROP CONSTRAINT "boolean_response_assessment_id_fkey";

-- DropForeignKey
ALTER TABLE "boolean_response" DROP CONSTRAINT "boolean_response_question_id_fkey";

-- DropForeignKey
ALTER TABLE "boolean_response" DROP CONSTRAINT "boolean_response_user_id_fkey";

-- DropTable
DROP TABLE "boolean_response";
