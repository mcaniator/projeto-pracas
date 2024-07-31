/*
  Warnings:

  - You are about to drop the column `subcategory` on the `question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "question" DROP COLUMN "subcategory",
ADD COLUMN     "subcategory_id" INTEGER;

-- CreateTable
CREATE TABLE "Subcategory" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "optional" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subcategory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Subcategory" ADD CONSTRAINT "Subcategory_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "Subcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
