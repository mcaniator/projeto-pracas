ALTER TYPE "question_types" ADD VALUE IF NOT EXISTS 'BOOLEAN';

ALTER TYPE "QuestionResponseCharacterTypes" RENAME TO "question_response_character_types";

ALTER TYPE "question_response_character_types" ADD VALUE IF NOT EXISTS 'BOOLEAN';