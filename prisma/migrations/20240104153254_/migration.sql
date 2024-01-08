/*
  Warnings:

  - You are about to drop the `_DelimitacaoAdministrativaToLocal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `delimitacao_administrativa` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_DelimitacaoAdministrativaToLocal" DROP CONSTRAINT "_DelimitacaoAdministrativaToLocal_A_fkey";

-- DropForeignKey
ALTER TABLE "_DelimitacaoAdministrativaToLocal" DROP CONSTRAINT "_DelimitacaoAdministrativaToLocal_B_fkey";

-- DropTable
DROP TABLE "_DelimitacaoAdministrativaToLocal";

-- DropTable
DROP TABLE "delimitacao_administrativa";

-- CreateTable
CREATE TABLE "delimitacao_administrativa_1" (
    "id" SERIAL NOT NULL,
    "nome_delimitacao_administrativa1" TEXT NOT NULL,

    CONSTRAINT "delimitacao_administrativa_1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delimitacao_administrativa_2" (
    "id" SERIAL NOT NULL,
    "nome_delimitacao_administrativa2" TEXT NOT NULL,

    CONSTRAINT "delimitacao_administrativa_2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delimitacao_administrativa_3" (
    "id" SERIAL NOT NULL,
    "nome_delimitacao_administrativa3" TEXT NOT NULL,

    CONSTRAINT "delimitacao_administrativa_3_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DelimitacaoAdministrativa1ToLocal" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_DelimitacaoAdministrativa2ToLocal" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_DelimitacaoAdministrativa3ToLocal" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_DelimitacaoAdministrativa1ToLocal_AB_unique" ON "_DelimitacaoAdministrativa1ToLocal"("A", "B");

-- CreateIndex
CREATE INDEX "_DelimitacaoAdministrativa1ToLocal_B_index" ON "_DelimitacaoAdministrativa1ToLocal"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DelimitacaoAdministrativa2ToLocal_AB_unique" ON "_DelimitacaoAdministrativa2ToLocal"("A", "B");

-- CreateIndex
CREATE INDEX "_DelimitacaoAdministrativa2ToLocal_B_index" ON "_DelimitacaoAdministrativa2ToLocal"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DelimitacaoAdministrativa3ToLocal_AB_unique" ON "_DelimitacaoAdministrativa3ToLocal"("A", "B");

-- CreateIndex
CREATE INDEX "_DelimitacaoAdministrativa3ToLocal_B_index" ON "_DelimitacaoAdministrativa3ToLocal"("B");

-- AddForeignKey
ALTER TABLE "_DelimitacaoAdministrativa1ToLocal" ADD CONSTRAINT "_DelimitacaoAdministrativa1ToLocal_A_fkey" FOREIGN KEY ("A") REFERENCES "delimitacao_administrativa_1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DelimitacaoAdministrativa1ToLocal" ADD CONSTRAINT "_DelimitacaoAdministrativa1ToLocal_B_fkey" FOREIGN KEY ("B") REFERENCES "local"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DelimitacaoAdministrativa2ToLocal" ADD CONSTRAINT "_DelimitacaoAdministrativa2ToLocal_A_fkey" FOREIGN KEY ("A") REFERENCES "delimitacao_administrativa_2"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DelimitacaoAdministrativa2ToLocal" ADD CONSTRAINT "_DelimitacaoAdministrativa2ToLocal_B_fkey" FOREIGN KEY ("B") REFERENCES "local"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DelimitacaoAdministrativa3ToLocal" ADD CONSTRAINT "_DelimitacaoAdministrativa3ToLocal_A_fkey" FOREIGN KEY ("A") REFERENCES "delimitacao_administrativa_3"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DelimitacaoAdministrativa3ToLocal" ADD CONSTRAINT "_DelimitacaoAdministrativa3ToLocal_B_fkey" FOREIGN KEY ("B") REFERENCES "local"("id") ON DELETE CASCADE ON UPDATE CASCADE;
