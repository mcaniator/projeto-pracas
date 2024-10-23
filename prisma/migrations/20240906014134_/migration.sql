/*
  Warnings:

  - The values [Options] on the enum `question_types` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "calculation_types" AS ENUM ('Sum', 'Average');

-- AlterEnum
BEGIN;
CREATE TYPE "question_types_new" AS ENUM ('Text', 'Numeric', 'Options Text', 'Options Numeric');
ALTER TABLE "question" ALTER COLUMN "type" TYPE "question_types_new" USING ("type"::text::"question_types_new");
ALTER TABLE "response" ALTER COLUMN "type" TYPE "question_types_new" USING ("type"::text::"question_types_new");
ALTER TYPE "question_types" RENAME TO "question_types_old";
ALTER TYPE "question_types_new" RENAME TO "question_types";
DROP TYPE "question_types_old";
COMMIT;

-- CreateTable
CREATE TABLE "calculation" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category_id" INTEGER NOT NULL,
    "subcategory_id" INTEGER,

    CONSTRAINT "calculation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CalculationToQuestion" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CalculationToQuestion_AB_unique" ON "_CalculationToQuestion"("A", "B");

-- CreateIndex
CREATE INDEX "_CalculationToQuestion_B_index" ON "_CalculationToQuestion"("B");

-- AddForeignKey
ALTER TABLE "calculation" ADD CONSTRAINT "calculation_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculation" ADD CONSTRAINT "calculation_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "subcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CalculationToQuestion" ADD CONSTRAINT "_CalculationToQuestion_A_fkey" FOREIGN KEY ("A") REFERENCES "calculation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CalculationToQuestion" ADD CONSTRAINT "_CalculationToQuestion_B_fkey" FOREIGN KEY ("B") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
