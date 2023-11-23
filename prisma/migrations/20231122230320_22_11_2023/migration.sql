/*
  Warnings:

  - The values [SEGUNDA,TERCA,QUARTA,QUINTA,SEXTA] on the enum `Dia` will be removed. If these variants are still used in the database, this will fail.
  - The `tipo` column on the `local` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `categoriaEspacoLivre` column on the `local` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `_avaliacaoTousuario` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[usuario_id]` on the table `avaliacao` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Tipos" AS ENUM ('PRACA');

-- CreateEnum
CREATE TYPE "CategoriasEspacoLivre" AS ENUM ('ESPACO_LIVRE_PUBLICO_USO_COLETIVO');

-- AlterEnum
BEGIN;
CREATE TYPE "Dia_new" AS ENUM ('DOMINGO', 'SEGUNDA_FEIRA', 'TERCA_FEIRA', 'QUARTA_FEIRA', 'QUINTA_FEIRA', 'SEXTA_FEIRA', 'SABADO');
ALTER TABLE "avaliacao" ALTER COLUMN "diaSemana" TYPE "Dia_new" USING ("diaSemana"::text::"Dia_new");
ALTER TYPE "Dia" RENAME TO "Dia_old";
ALTER TYPE "Dia_new" RENAME TO "Dia";
DROP TYPE "Dia_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "_avaliacaoTousuario" DROP CONSTRAINT "_avaliacaoTousuario_A_fkey";

-- DropForeignKey
ALTER TABLE "_avaliacaoTousuario" DROP CONSTRAINT "_avaliacaoTousuario_B_fkey";

-- DropForeignKey
ALTER TABLE "acessibilidade" DROP CONSTRAINT "acessibilidade_avaliacao_id_fkey";

-- DropForeignKey
ALTER TABLE "acessoEntorno" DROP CONSTRAINT "acessoEntorno_avaliacao_id_fkey";

-- DropForeignKey
ALTER TABLE "areaAtividades" DROP CONSTRAINT "areaAtividades_avaliacao_id_fkey";

-- DropForeignKey
ALTER TABLE "contagem" DROP CONSTRAINT "contagem_avaliacao_id_fkey";

-- DropForeignKey
ALTER TABLE "depredacao" DROP CONSTRAINT "depredacao_avaliacao_id_fkey";

-- DropForeignKey
ALTER TABLE "elementosPaisagisticos" DROP CONSTRAINT "elementosPaisagisticos_avaliacao_id_fkey";

-- DropForeignKey
ALTER TABLE "espacosAssento" DROP CONSTRAINT "espacosAssento_avaliacao_id_fkey";

-- DropForeignKey
ALTER TABLE "feira" DROP CONSTRAINT "feira_avaliacao_id_fkey";

-- DropForeignKey
ALTER TABLE "pessoaNoLocal" DROP CONSTRAINT "pessoaNoLocal_contagem_id_fkey";

-- DropForeignKey
ALTER TABLE "ruido" DROP CONSTRAINT "ruido_avaliacao_id_fkey";

-- DropForeignKey
ALTER TABLE "segurancaViaria" DROP CONSTRAINT "segurancaViaria_avaliacao_id_fkey";

-- DropForeignKey
ALTER TABLE "usoDensidadeEntorno" DROP CONSTRAINT "usoDensidadeEntorno_avaliacao_id_fkey";

-- DropForeignKey
ALTER TABLE "vigilancia" DROP CONSTRAINT "vigilancia_avaliacao_id_fkey";

-- AlterTable
ALTER TABLE "acessibilidade" ALTER COLUMN "avaliacao_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "acessoEntorno" ALTER COLUMN "avaliacao_id" DROP NOT NULL,
ALTER COLUMN "created_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "areaAtividades" ALTER COLUMN "avaliacao_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "avaliacao" ALTER COLUMN "local_id" DROP NOT NULL,
ALTER COLUMN "usuario_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "contagem" ALTER COLUMN "avaliacao_id" DROP NOT NULL,
ALTER COLUMN "created_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "depredacao" ALTER COLUMN "avaliacao_id" DROP NOT NULL,
ALTER COLUMN "created_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "elementosPaisagisticos" ALTER COLUMN "avaliacao_id" DROP NOT NULL,
ALTER COLUMN "descricao" DROP NOT NULL,
ALTER COLUMN "created_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "endereco" ALTER COLUMN "local_id" DROP NOT NULL,
ALTER COLUMN "cidade" SET DATA TYPE TEXT,
ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "espacosAssento" ALTER COLUMN "avaliacao_id" DROP NOT NULL,
ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "feira" ALTER COLUMN "avaliacao_id" DROP NOT NULL,
ALTER COLUMN "nomeResponsavel" DROP NOT NULL,
ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "local" ALTER COLUMN "nome" DROP NOT NULL,
DROP COLUMN "tipo",
ADD COLUMN     "tipo" "Tipos",
DROP COLUMN "categoriaEspacoLivre",
ADD COLUMN     "categoriaEspacoLivre" "CategoriasEspacoLivre";

-- AlterTable
ALTER TABLE "pessoaNoLocal" ALTER COLUMN "contagem_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ruido" ALTER COLUMN "avaliacao_id" DROP NOT NULL,
ALTER COLUMN "categoria" DROP NOT NULL,
ALTER COLUMN "created_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "segurancaViaria" ALTER COLUMN "avaliacao_id" DROP NOT NULL,
ALTER COLUMN "created_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "usoDensidadeEntorno" ALTER COLUMN "avaliacao_id" DROP NOT NULL,
ALTER COLUMN "usoEdificacoes" DROP NOT NULL,
ALTER COLUMN "created_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "usuario" ALTER COLUMN "nome" DROP NOT NULL,
ALTER COLUMN "tipo" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "senha" DROP NOT NULL,
ALTER COLUMN "created_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "vigilancia" ALTER COLUMN "avaliacao_id" DROP NOT NULL,
ALTER COLUMN "created_at" DROP NOT NULL;

-- DropTable
DROP TABLE "_avaliacaoTousuario";

-- CreateTable
CREATE TABLE "cidade" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255),
    "regioes" TEXT[],

    CONSTRAINT "cidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avalicao_usuario" (
    "avaliacao_usuario_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,

    CONSTRAINT "avalicao_usuario_pkey" PRIMARY KEY ("avaliacao_usuario_id","usuario_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cidade_nome_key" ON "cidade"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "avaliacao_usuario_id_key" ON "avaliacao"("usuario_id");

-- AddForeignKey
ALTER TABLE "acessibilidade" ADD CONSTRAINT "acessibilidade_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "areaAtividades" ADD CONSTRAINT "areaAtividades_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acessoEntorno" ADD CONSTRAINT "acessoEntorno_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contagem" ADD CONSTRAINT "contagem_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "depredacao" ADD CONSTRAINT "depredacao_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "elementosPaisagisticos" ADD CONSTRAINT "elementosPaisagisticos_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "endereco" ADD CONSTRAINT "endereco_cidade_fkey" FOREIGN KEY ("cidade") REFERENCES "cidade"("nome") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "espacosAssento" ADD CONSTRAINT "espacosAssento_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feira" ADD CONSTRAINT "feira_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pessoaNoLocal" ADD CONSTRAINT "pessoaNoLocal_contagem_id_fkey" FOREIGN KEY ("contagem_id") REFERENCES "contagem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ruido" ADD CONSTRAINT "ruido_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segurancaViaria" ADD CONSTRAINT "segurancaViaria_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usoDensidadeEntorno" ADD CONSTRAINT "usoDensidadeEntorno_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vigilancia" ADD CONSTRAINT "vigilancia_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avalicao_usuario" ADD CONSTRAINT "avalicao_usuario_avaliacao_usuario_id_fkey" FOREIGN KEY ("avaliacao_usuario_id") REFERENCES "avaliacao"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avalicao_usuario" ADD CONSTRAINT "avalicao_usuario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
