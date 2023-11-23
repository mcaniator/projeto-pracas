/*
  Warnings:

  - You are about to drop the column `regioes` on the `cidade` table. All the data in the column will be lost.
  - You are about to drop the column `cidade` on the `endereco` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "endereco" DROP CONSTRAINT "endereco_cidade_fkey";

-- AlterTable
ALTER TABLE "cidade" DROP COLUMN "regioes";

-- AlterTable
ALTER TABLE "endereco" DROP COLUMN "cidade",
ADD COLUMN     "cidade_id" INTEGER;

-- AddForeignKey
ALTER TABLE "endereco" ADD CONSTRAINT "endereco_cidade_id_fkey" FOREIGN KEY ("cidade_id") REFERENCES "cidade"("id") ON DELETE SET NULL ON UPDATE CASCADE;
