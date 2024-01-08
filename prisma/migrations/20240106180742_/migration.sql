/*
  Warnings:

  - A unique constraint covering the columns `[nome_delimitacao_administrativa1]` on the table `delimitacao_administrativa_1` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nome_delimitacao_administrativa2]` on the table `delimitacao_administrativa_2` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nome_delimitacao_administrativa3]` on the table `delimitacao_administrativa_3` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "delimitacao_administrativa_1_nome_delimitacao_administrativ_key" ON "delimitacao_administrativa_1"("nome_delimitacao_administrativa1");

-- CreateIndex
CREATE UNIQUE INDEX "delimitacao_administrativa_2_nome_delimitacao_administrativ_key" ON "delimitacao_administrativa_2"("nome_delimitacao_administrativa2");

-- CreateIndex
CREATE UNIQUE INDEX "delimitacao_administrativa_3_nome_delimitacao_administrativ_key" ON "delimitacao_administrativa_3"("nome_delimitacao_administrativa3");
