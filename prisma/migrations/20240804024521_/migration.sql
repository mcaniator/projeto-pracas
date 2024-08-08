/*
  Warnings:

  - You are about to drop the column `subcategory_id` on the `subcategory` table. All the data in the column will be lost.
  - Added the required column `category_id` to the `subcategory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "subcategory" DROP CONSTRAINT "subcategory_subcategory_id_fkey";

-- AlterTable
ALTER TABLE "subcategory" DROP COLUMN "subcategory_id",
ADD COLUMN     "category_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "subcategory" ADD CONSTRAINT "subcategory_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
