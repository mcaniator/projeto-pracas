/*
  Warnings:

  - You are about to drop the column `nome` on the `form` table. All the data in the column will be lost.
  - Added the required column `name` to the `form` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `form` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "question_types" AS ENUM ('Text', 'Numeric', 'Options');

-- CreateEnum
CREATE TYPE "option_types" AS ENUM ('selection', 'radio', 'checkbox');

-- AlterTable
ALTER TABLE "form" DROP COLUMN "nome",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "name" VARCHAR(255) NOT NULL,
ADD COLUMN     "optional" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "question_types" NOT NULL;

-- CreateTable
CREATE TABLE "text_question" (
    "id" SERIAL NOT NULL,
    "char_limit" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,

    CONSTRAINT "text_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "numeric_question" (
    "id" SERIAL NOT NULL,
    "min" INTEGER,
    "max" INTEGER,
    "question_id" INTEGER NOT NULL,

    CONSTRAINT "numeric_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "options_question" (
    "id" SERIAL NOT NULL,
    "option_type" "option_types" NOT NULL,
    "maximum_selections" INTEGER,
    "question_id" INTEGER NOT NULL,

    CONSTRAINT "options_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "option" (
    "id" SERIAL NOT NULL,
    "text" VARCHAR(255) NOT NULL,
    "options_question_id" INTEGER NOT NULL,

    CONSTRAINT "option_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "text_question_question_id_key" ON "text_question"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "numeric_question_question_id_key" ON "numeric_question"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "options_question_question_id_key" ON "options_question"("question_id");

-- AddForeignKey
ALTER TABLE "text_question" ADD CONSTRAINT "text_question_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "numeric_question" ADD CONSTRAINT "numeric_question_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "options_question" ADD CONSTRAINT "options_question_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "option" ADD CONSTRAINT "option_options_question_id_fkey" FOREIGN KEY ("options_question_id") REFERENCES "options_question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
