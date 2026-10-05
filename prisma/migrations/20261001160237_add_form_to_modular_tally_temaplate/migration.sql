/*
  Warnings:

  - You are about to drop the column `form_id` on the `modular_tally` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[form_submission_id]` on the table `modular_tally` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "modular_tally" DROP CONSTRAINT "modular_tally_form_id_fkey";

-- DropForeignKey
ALTER TABLE "modular_tally" DROP CONSTRAINT "modular_tally_form_submission_id_form_id_fkey";

-- DropIndex
DROP INDEX "modular_tally_form_submission_id_form_id_key";

-- AlterTable
ALTER TABLE "modular_tally" DROP COLUMN "form_id";

-- AlterTable
ALTER TABLE "modular_tally_template" ADD COLUMN     "form_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "modular_tally_form_submission_id_key" ON "modular_tally"("form_submission_id");

-- AddForeignKey
ALTER TABLE "modular_tally_template" ADD CONSTRAINT "modular_tally_template_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "form"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modular_tally" ADD CONSTRAINT "modular_tally_form_submission_id_fkey" FOREIGN KEY ("form_submission_id") REFERENCES "form_submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
