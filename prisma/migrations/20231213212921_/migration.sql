/*
  Warnings:

  - You are about to drop the column `avaliacao_id` on the `contagem` table. All the data in the column will be lost.
  - You are about to drop the column `avaliacao_id` on the `ruido` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[local_id]` on the table `contagem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[local_id]` on the table `ruido` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `local_id` to the `contagem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `local_id` to the `ruido` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "contagem" DROP CONSTRAINT "contagem_avaliacao_id_fkey";

-- DropForeignKey
ALTER TABLE "ruido" DROP CONSTRAINT "ruido_avaliacao_id_fkey";

-- DropIndex
DROP INDEX "contagem_avaliacao_id_key";

-- DropIndex
DROP INDEX "ruido_avaliacao_id_key";

-- AlterTable
ALTER TABLE "contagem" DROP COLUMN "avaliacao_id",
ADD COLUMN     "local_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "local" ADD COLUMN     "e_praca" BOOLEAN;

-- AlterTable
ALTER TABLE "ruido" DROP COLUMN "avaliacao_id",
ADD COLUMN     "local_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "delimitacao_administrativa" (
    "id" SERIAL NOT NULL,
    "nome_delimitacao_administrativa" TEXT NOT NULL,

    CONSTRAINT "delimitacao_administrativa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DelimitacaoAdministrativaToLocal" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_DelimitacaoAdministrativaToLocal_AB_unique" ON "_DelimitacaoAdministrativaToLocal"("A", "B");

-- CreateIndex
CREATE INDEX "_DelimitacaoAdministrativaToLocal_B_index" ON "_DelimitacaoAdministrativaToLocal"("B");

-- CreateIndex
CREATE UNIQUE INDEX "contagem_local_id_key" ON "contagem"("local_id");

-- CreateIndex
CREATE UNIQUE INDEX "ruido_local_id_key" ON "ruido"("local_id");

-- AddForeignKey
ALTER TABLE "contagem" ADD CONSTRAINT "contagem_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ruido" ADD CONSTRAINT "ruido_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DelimitacaoAdministrativaToLocal" ADD CONSTRAINT "_DelimitacaoAdministrativaToLocal_A_fkey" FOREIGN KEY ("A") REFERENCES "delimitacao_administrativa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DelimitacaoAdministrativaToLocal" ADD CONSTRAINT "_DelimitacaoAdministrativaToLocal_B_fkey" FOREIGN KEY ("B") REFERENCES "local"("id") ON DELETE CASCADE ON UPDATE CASCADE;
