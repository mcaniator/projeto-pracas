/*
  Warnings:

  - The `tipo` column on the `local` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `categoriaEspacoLivre` column on the `local` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "local" DROP COLUMN "tipo",
ADD COLUMN     "tipo" INTEGER,
DROP COLUMN "categoriaEspacoLivre",
ADD COLUMN     "categoriaEspacoLivre" INTEGER;

-- CreateTable
CREATE TABLE "regiao" (
    "id" SERIAL NOT NULL,
    "regiao" TEXT NOT NULL,

    CONSTRAINT "regiao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cidade_regiao" (
    "cidade_id" INTEGER NOT NULL,
    "regiao_id" INTEGER NOT NULL,

    CONSTRAINT "cidade_regiao_pkey" PRIMARY KEY ("cidade_id","regiao_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cidade_regiao_cidade_id_key" ON "cidade_regiao"("cidade_id");

-- CreateIndex
CREATE UNIQUE INDEX "cidade_regiao_regiao_id_key" ON "cidade_regiao"("regiao_id");

-- AddForeignKey
ALTER TABLE "cidade_regiao" ADD CONSTRAINT "cidade_regiao_cidade_id_fkey" FOREIGN KEY ("cidade_id") REFERENCES "cidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cidade_regiao" ADD CONSTRAINT "cidade_regiao_regiao_id_fkey" FOREIGN KEY ("regiao_id") REFERENCES "regiao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
