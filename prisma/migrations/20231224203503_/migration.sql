/*
  Warnings:

  - You are about to drop the `_DelimitacaoAdministrativaToLocal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `delimitacao_administrativa` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_DelimitacaoAdministrativaToLocal" DROP CONSTRAINT "_DelimitacaoAdministrativaToLocal_A_fkey";

-- DropForeignKey
ALTER TABLE "_DelimitacaoAdministrativaToLocal" DROP CONSTRAINT "_DelimitacaoAdministrativaToLocal_B_fkey";

-- AlterTable
ALTER TABLE "local" ADD COLUMN     "delimitacao_administrativa_mais_ampla" TEXT,
ADD COLUMN     "delimitacao_administrativa_menos_ampla" TEXT;

-- DropTable
DROP TABLE "_DelimitacaoAdministrativaToLocal";

-- DropTable
DROP TABLE "delimitacao_administrativa";
