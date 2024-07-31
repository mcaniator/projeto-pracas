/*
  Warnings:

  - You are about to drop the column `subcategory_id` on the `question` table. All the data in the column will be lost.
  - You are about to drop the `Subcategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Subcategory" DROP CONSTRAINT "Subcategory_category_id_fkey";

-- DropForeignKey
ALTER TABLE "question" DROP CONSTRAINT "question_subcategory_id_fkey";

-- AlterTable
ALTER TABLE "question" DROP COLUMN "subcategory_id",
ADD COLUMN     "subcategory" VARCHAR(255);

-- DropTable
DROP TABLE "Subcategory";
