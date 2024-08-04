/*
  Warnings:

  - You are about to drop the `Subcategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Subcategory" DROP CONSTRAINT "Subcategory_subcategory_id_fkey";

-- DropForeignKey
ALTER TABLE "question" DROP CONSTRAINT "question_subcategory_id_fkey";

-- DropTable
DROP TABLE "Subcategory";

-- CreateTable
CREATE TABLE "subcategory" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "optional" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "subcategory_id" INTEGER NOT NULL,

    CONSTRAINT "subcategory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "subcategory" ADD CONSTRAINT "subcategory_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "subcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
