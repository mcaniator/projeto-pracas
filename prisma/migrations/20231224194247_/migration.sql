/*
  Warnings:

  - You are about to drop the `form` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[options_question_id]` on the table `option` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "form" DROP CONSTRAINT "form_category_id_fkey";

-- DropForeignKey
ALTER TABLE "numeric_question" DROP CONSTRAINT "numeric_question_question_id_fkey";

-- DropForeignKey
ALTER TABLE "options_question" DROP CONSTRAINT "options_question_question_id_fkey";

-- DropForeignKey
ALTER TABLE "text_question" DROP CONSTRAINT "text_question_question_id_fkey";

-- DropTable
DROP TABLE "form";

-- CreateTable
CREATE TABLE "question" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "optional" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "type" "question_types" NOT NULL,
    "category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "option_options_question_id_key" ON "option"("options_question_id");

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "text_question" ADD CONSTRAINT "text_question_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "numeric_question" ADD CONSTRAINT "numeric_question_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "options_question" ADD CONSTRAINT "options_question_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
