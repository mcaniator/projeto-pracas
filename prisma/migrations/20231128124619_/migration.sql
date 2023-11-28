/*
  Warnings:

  - You are about to drop the column `alturaLivre` on the `acessibilidade` table. All the data in the column will be lost.
  - You are about to drop the column `ausenciaObstaculos` on the `acessibilidade` table. All the data in the column will be lost.
  - You are about to drop the column `calcadaEntornoFaixaLivre` on the `acessibilidade` table. All the data in the column will be lost.
  - You are about to drop the column `calcadaEntornoFaixaServico` on the `acessibilidade` table. All the data in the column will be lost.
  - You are about to drop the column `equipamentoAdaptado` on the `acessibilidade` table. All the data in the column will be lost.
  - You are about to drop the column `inclinacaoLongitudinal` on the `acessibilidade` table. All the data in the column will be lost.
  - You are about to drop the column `inclinacaoMax` on the `acessibilidade` table. All the data in the column will be lost.
  - You are about to drop the column `revestimentoPiso` on the `acessibilidade` table. All the data in the column will be lost.
  - You are about to drop the column `rotaAcessivel` on the `acessibilidade` table. All the data in the column will be lost.
  - You are about to drop the column `sinalizacaoTatil` on the `acessibilidade` table. All the data in the column will be lost.
  - You are about to drop the column `travessiaRebaixamento` on the `acessibilidade` table. All the data in the column will be lost.
  - You are about to drop the column `vagasIdosos` on the `acessibilidade` table. All the data in the column will be lost.
  - You are about to drop the column `vagasPCD` on the `acessibilidade` table. All the data in the column will be lost.
  - You are about to drop the column `alteracaoLimites` on the `avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `calcadaPavimentada` on the `avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `conservacaoBanheiro` on the `avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `conservacaoBededouro` on the `avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `conservacaoCadeiraMoveis` on the `avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `conservacaoCalcada` on the `avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `conservacaoLixeiras` on the `avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `conservacaoObraArte` on the `avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `conservacaoPaisagismoPlanejado` on the `avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `conservacaoTelefonePublico` on the `avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `diaSemana` on the `avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `qtdBanheiro` on the `avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `qtdBededouro` on the `avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `qtdCadeiraMoveis` on the `avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `qtdLixeiras` on the `avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `qtdObraArte` on the `avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `qtdPaisagismoPlanejado` on the `avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `qtdTelefonePublico` on the `avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `usuario_id` on the `avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `condicaoCeu` on the `contagem` table. All the data in the column will be lost.
  - You are about to drop the column `qtdAnimais` on the `contagem` table. All the data in the column will be lost.
  - You are about to drop the column `nivelAbandono` on the `depredacao` table. All the data in the column will be lost.
  - You are about to drop the column `nivelPichacao` on the `depredacao` table. All the data in the column will be lost.
  - You are about to drop the column `CEP` on the `endereco` table. All the data in the column will be lost.
  - You are about to drop the column `UF` on the `endereco` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `endereco` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `endereco` table. All the data in the column will be lost.
  - You are about to drop the column `anoCriacao` on the `local` table. All the data in the column will be lost.
  - You are about to drop the column `anoReforma` on the `local` table. All the data in the column will be lost.
  - You are about to drop the column `areaPrefeitura` on the `local` table. All the data in the column will be lost.
  - You are about to drop the column `areaUtil` on the `local` table. All the data in the column will be lost.
  - You are about to drop the column `categoriaEspacoLivre` on the `local` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `local` table. All the data in the column will be lost.
  - You are about to drop the column `inativoNaoLocalizado` on the `local` table. All the data in the column will be lost.
  - You are about to drop the column `poligonoArea` on the `local` table. All the data in the column will be lost.
  - You are about to drop the column `prefeitoCriacao` on the `local` table. All the data in the column will be lost.
  - You are about to drop the column `regiaoUrbana` on the `local` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `local` table. All the data in the column will be lost.
  - You are about to drop the column `nivelDb` on the `ruido` table. All the data in the column will be lost.
  - You are about to drop the column `nivelVisibilidade` on the `vigilancia` table. All the data in the column will be lost.
  - You are about to drop the column `postoPolicial` on the `vigilancia` table. All the data in the column will be lost.
  - You are about to drop the `acessoEntorno` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `areaAtividades` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `avalicao_usuario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cidade_regiao` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `elementosPaisagisticos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `espacosAssento` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `feira` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pessoaNoLocal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `segurancaViaria` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usoDensidadeEntorno` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `altura_livre` to the `acessibilidade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ausencia_obstaculos` to the `acessibilidade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `calcada_entorno_faixa_livre` to the `acessibilidade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `calcada_entrono_faixa_servico` to the `acessibilidade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `equipamento_adaptado` to the `acessibilidade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iclinacao_max` to the `acessibilidade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inclinacao_longitudinal` to the `acessibilidade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revestimento_piso` to the `acessibilidade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rota_acessivel` to the `acessibilidade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sinalizacao_tatil` to the `acessibilidade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `travessia_rebaixamento` to the `acessibilidade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vagas_idosos` to the `acessibilidade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vagas_pcd` to the `acessibilidade` table without a default value. This is not possible if the table is not empty.
  - Made the column `avaliacao_id` on table `acessibilidade` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `acessibilidade` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `calcada_pavimentada` to the `avaliacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conservacao_banheiro` to the `avaliacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conservacao_bebedouro` to the `avaliacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conservacao_cadeira_moveis` to the `avaliacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conservacao_calcada` to the `avaliacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conservacao_lixeiras` to the `avaliacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conservacao_obra_arte` to the `avaliacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conservacao_paisagismo_planejado` to the `avaliacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conservacao_telefone_publico` to the `avaliacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dia_semana` to the `avaliacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantidade_banheiro` to the `avaliacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantidade_bebedouro` to the `avaliacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantidade_cadeira_moveis` to the `avaliacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantidade_lixeiras` to the `avaliacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantidade_obra_arte` to the `avaliacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantidade_paisagismo_planejado` to the `avaliacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantidade_telefone_publico` to the `avaliacao` table without a default value. This is not possible if the table is not empty.
  - Made the column `local_id` on table `avaliacao` required. This step will fail if there are existing NULL values in that column.
  - Made the column `data` on table `avaliacao` required. This step will fail if there are existing NULL values in that column.
  - Made the column `inicio` on table `avaliacao` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fim` on table `avaliacao` required. This step will fail if there are existing NULL values in that column.
  - Made the column `wifi` on table `avaliacao` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `avaliacao` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `avaliacao` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nome` on table `cidade` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `condicao_ceu` to the `contagem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantidade_animais` to the `contagem` table without a default value. This is not possible if the table is not empty.
  - Made the column `avaliacao_id` on table `contagem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `data` on table `contagem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `inicio` on table `contagem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fim` on table `contagem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `temperatura` on table `contagem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `contagem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `contagem` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `nivel_abandono` to the `depredacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nivel_pichacao` to the `depredacao` table without a default value. This is not possible if the table is not empty.
  - Made the column `avaliacao_id` on table `depredacao` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `depredacao` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `depredacao` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `cep` to the `endereco` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estado` to the `endereco` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `endereco` table without a default value. This is not possible if the table is not empty.
  - Made the column `local_id` on table `endereco` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bairro` on table `endereco` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rua` on table `endereco` required. This step will fail if there are existing NULL values in that column.
  - Made the column `numero` on table `endereco` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cidade_id` on table `endereco` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `ano_criacao` to the `local` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ano_reforma` to the `local` table without a default value. This is not possible if the table is not empty.
  - Added the required column `area_util` to the `local` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoria_espaco_livre` to the `local` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invativo_nao_localizado` to the `local` table without a default value. This is not possible if the table is not empty.
  - Added the required column `poligono_area` to the `local` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prefeito_criacao` to the `local` table without a default value. This is not possible if the table is not empty.
  - Added the required column `regiao_urbana` to the `local` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `local` table without a default value. This is not possible if the table is not empty.
  - Made the column `nome` on table `local` required. This step will fail if there are existing NULL values in that column.
  - Made the column `poligono` on table `local` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `tipo` to the `local` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `regiao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nivel_db` to the `ruido` table without a default value. This is not possible if the table is not empty.
  - Made the column `avaliacao_id` on table `ruido` required. This step will fail if there are existing NULL values in that column.
  - Made the column `categoria` on table `ruido` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `ruido` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `ruido` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nome` on table `usuario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `usuario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `senha` on table `usuario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `usuario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `usuario` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `tipo` to the `usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nivel_visibilidade` to the `vigilancia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `posto_policial` to the `vigilancia` table without a default value. This is not possible if the table is not empty.
  - Made the column `avaliacao_id` on table `vigilancia` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cameras` on table `vigilancia` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `vigilancia` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `vigilancia` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "dia_semana" AS ENUM ('Domingo', 'Segunda Feira', 'Terça Feira', 'Quarta Feira', 'Quinta Feira', 'Sexta Feira', 'Sábado');

-- CreateEnum
CREATE TYPE "estados" AS ENUM ('Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal', 'Espírito Santo', 'Goiás', 'Maranhão', 'Matro Grosso', 'Mato Grosso do Sul', 'Minas Gerais', 'Pará', 'Paraíba', 'Paraná', 'Pernambuco', 'Piauí', 'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia', 'Roraima', 'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins');

-- CreateEnum
CREATE TYPE "tipos_local" AS ENUM ('PRACA');

-- CreateEnum
CREATE TYPE "tipos_usuario" AS ENUM ('ADMIN', 'PESQUISADOR');

-- CreateEnum
CREATE TYPE "categorias_espaco_livre" AS ENUM ('ESPACO_LIVRE_PUBLICO_USO_COLETIVO');

-- DropForeignKey
ALTER TABLE "acessibilidade" DROP CONSTRAINT "acessibilidade_avaliacao_id_fkey";

-- DropForeignKey
ALTER TABLE "acessoEntorno" DROP CONSTRAINT "acessoEntorno_avaliacao_id_fkey";

-- DropForeignKey
ALTER TABLE "areaAtividades" DROP CONSTRAINT "areaAtividades_avaliacao_id_fkey";

-- DropForeignKey
ALTER TABLE "avalicao_usuario" DROP CONSTRAINT "avalicao_usuario_avaliacao_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "avalicao_usuario" DROP CONSTRAINT "avalicao_usuario_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "cidade_regiao" DROP CONSTRAINT "cidade_regiao_cidade_id_fkey";

-- DropForeignKey
ALTER TABLE "cidade_regiao" DROP CONSTRAINT "cidade_regiao_regiao_id_fkey";

-- DropForeignKey
ALTER TABLE "contagem" DROP CONSTRAINT "contagem_avaliacao_id_fkey";

-- DropForeignKey
ALTER TABLE "depredacao" DROP CONSTRAINT "depredacao_avaliacao_id_fkey";

-- DropForeignKey
ALTER TABLE "elementosPaisagisticos" DROP CONSTRAINT "elementosPaisagisticos_avaliacao_id_fkey";

-- DropForeignKey
ALTER TABLE "endereco" DROP CONSTRAINT "endereco_cidade_id_fkey";

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

-- DropIndex
DROP INDEX "avaliacao_usuario_id_key";

-- AlterTable
ALTER TABLE "acessibilidade" DROP COLUMN "alturaLivre",
DROP COLUMN "ausenciaObstaculos",
DROP COLUMN "calcadaEntornoFaixaLivre",
DROP COLUMN "calcadaEntornoFaixaServico",
DROP COLUMN "equipamentoAdaptado",
DROP COLUMN "inclinacaoLongitudinal",
DROP COLUMN "inclinacaoMax",
DROP COLUMN "revestimentoPiso",
DROP COLUMN "rotaAcessivel",
DROP COLUMN "sinalizacaoTatil",
DROP COLUMN "travessiaRebaixamento",
DROP COLUMN "vagasIdosos",
DROP COLUMN "vagasPCD",
ADD COLUMN     "altura_livre" BOOLEAN NOT NULL,
ADD COLUMN     "ausencia_obstaculos" BOOLEAN NOT NULL,
ADD COLUMN     "calcada_entorno_faixa_livre" BOOLEAN NOT NULL,
ADD COLUMN     "calcada_entrono_faixa_servico" BOOLEAN NOT NULL,
ADD COLUMN     "equipamento_adaptado" BOOLEAN NOT NULL,
ADD COLUMN     "iclinacao_max" BOOLEAN NOT NULL,
ADD COLUMN     "inclinacao_longitudinal" BOOLEAN NOT NULL,
ADD COLUMN     "revestimento_piso" BOOLEAN NOT NULL,
ADD COLUMN     "rota_acessivel" BOOLEAN NOT NULL,
ADD COLUMN     "sinalizacao_tatil" BOOLEAN NOT NULL,
ADD COLUMN     "travessia_rebaixamento" BOOLEAN NOT NULL,
ADD COLUMN     "vagas_idosos" INTEGER NOT NULL,
ADD COLUMN     "vagas_pcd" INTEGER NOT NULL,
ALTER COLUMN "avaliacao_id" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "avaliacao" DROP COLUMN "alteracaoLimites",
DROP COLUMN "calcadaPavimentada",
DROP COLUMN "conservacaoBanheiro",
DROP COLUMN "conservacaoBededouro",
DROP COLUMN "conservacaoCadeiraMoveis",
DROP COLUMN "conservacaoCalcada",
DROP COLUMN "conservacaoLixeiras",
DROP COLUMN "conservacaoObraArte",
DROP COLUMN "conservacaoPaisagismoPlanejado",
DROP COLUMN "conservacaoTelefonePublico",
DROP COLUMN "diaSemana",
DROP COLUMN "qtdBanheiro",
DROP COLUMN "qtdBededouro",
DROP COLUMN "qtdCadeiraMoveis",
DROP COLUMN "qtdLixeiras",
DROP COLUMN "qtdObraArte",
DROP COLUMN "qtdPaisagismoPlanejado",
DROP COLUMN "qtdTelefonePublico",
DROP COLUMN "usuario_id",
ADD COLUMN     "alteracao_limites" BOOLEAN,
ADD COLUMN     "calcada_pavimentada" BOOLEAN NOT NULL,
ADD COLUMN     "conservacao_banheiro" INTEGER NOT NULL,
ADD COLUMN     "conservacao_bebedouro" INTEGER NOT NULL,
ADD COLUMN     "conservacao_cadeira_moveis" INTEGER NOT NULL,
ADD COLUMN     "conservacao_calcada" INTEGER NOT NULL,
ADD COLUMN     "conservacao_lixeiras" INTEGER NOT NULL,
ADD COLUMN     "conservacao_obra_arte" INTEGER NOT NULL,
ADD COLUMN     "conservacao_paisagismo_planejado" INTEGER NOT NULL,
ADD COLUMN     "conservacao_telefone_publico" INTEGER NOT NULL,
ADD COLUMN     "dia_semana" "dia_semana" NOT NULL,
ADD COLUMN     "quantidade_banheiro" INTEGER NOT NULL,
ADD COLUMN     "quantidade_bebedouro" INTEGER NOT NULL,
ADD COLUMN     "quantidade_cadeira_moveis" INTEGER NOT NULL,
ADD COLUMN     "quantidade_lixeiras" INTEGER NOT NULL,
ADD COLUMN     "quantidade_obra_arte" INTEGER NOT NULL,
ADD COLUMN     "quantidade_paisagismo_planejado" INTEGER NOT NULL,
ADD COLUMN     "quantidade_telefone_publico" INTEGER NOT NULL,
ALTER COLUMN "local_id" SET NOT NULL,
ALTER COLUMN "data" SET NOT NULL,
ALTER COLUMN "inicio" SET NOT NULL,
ALTER COLUMN "inicio" SET DATA TYPE TIMETZ(0),
ALTER COLUMN "fim" SET NOT NULL,
ALTER COLUMN "fim" SET DATA TYPE TIMETZ(0),
ALTER COLUMN "wifi" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "cidade" ADD COLUMN     "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3),
ALTER COLUMN "nome" SET NOT NULL;

-- AlterTable
ALTER TABLE "contagem" DROP COLUMN "condicaoCeu",
DROP COLUMN "qtdAnimais",
ADD COLUMN     "condicao_ceu" TEXT NOT NULL,
ADD COLUMN     "quantidade_animais" INTEGER NOT NULL,
ALTER COLUMN "avaliacao_id" SET NOT NULL,
ALTER COLUMN "data" SET NOT NULL,
ALTER COLUMN "inicio" SET NOT NULL,
ALTER COLUMN "inicio" SET DATA TYPE TIMESTAMPTZ(0),
ALTER COLUMN "fim" SET NOT NULL,
ALTER COLUMN "fim" SET DATA TYPE TIMESTAMPTZ(0),
ALTER COLUMN "temperatura" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "depredacao" DROP COLUMN "nivelAbandono",
DROP COLUMN "nivelPichacao",
ADD COLUMN     "nivel_abandono" INTEGER NOT NULL,
ADD COLUMN     "nivel_pichacao" INTEGER NOT NULL,
ALTER COLUMN "avaliacao_id" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "endereco" DROP COLUMN "CEP",
DROP COLUMN "UF",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "cep" VARCHAR(255) NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "estado" "estados" NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "local_id" SET NOT NULL,
ALTER COLUMN "bairro" SET NOT NULL,
ALTER COLUMN "rua" SET NOT NULL,
ALTER COLUMN "numero" SET NOT NULL,
ALTER COLUMN "cidade_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "local" DROP COLUMN "anoCriacao",
DROP COLUMN "anoReforma",
DROP COLUMN "areaPrefeitura",
DROP COLUMN "areaUtil",
DROP COLUMN "categoriaEspacoLivre",
DROP COLUMN "createdAt",
DROP COLUMN "inativoNaoLocalizado",
DROP COLUMN "poligonoArea",
DROP COLUMN "prefeitoCriacao",
DROP COLUMN "regiaoUrbana",
DROP COLUMN "updatedAt",
ADD COLUMN     "ano_criacao" DATE NOT NULL,
ADD COLUMN     "ano_reforma" DATE NOT NULL,
ADD COLUMN     "area_prefeitura" DOUBLE PRECISION,
ADD COLUMN     "area_util" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "categoria_espaco_livre" "categorias_espaco_livre" NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "invativo_nao_localizado" BOOLEAN NOT NULL,
ADD COLUMN     "poligono_area" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "prefeito_criacao" VARCHAR(255) NOT NULL,
ADD COLUMN     "regiao_urbana" VARCHAR(255) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "nome" SET NOT NULL,
ALTER COLUMN "poligono" SET NOT NULL,
DROP COLUMN "tipo",
ADD COLUMN     "tipo" "tipos_local" NOT NULL;

-- AlterTable
ALTER TABLE "regiao" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ruido" DROP COLUMN "nivelDb",
ADD COLUMN     "nivel_db" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "avaliacao_id" SET NOT NULL,
ALTER COLUMN "categoria" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "usuario" ALTER COLUMN "nome" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "senha" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL,
DROP COLUMN "tipo",
ADD COLUMN     "tipo" "tipos_usuario" NOT NULL;

-- AlterTable
ALTER TABLE "vigilancia" DROP COLUMN "nivelVisibilidade",
DROP COLUMN "postoPolicial",
ADD COLUMN     "nivel_visibilidade" INTEGER NOT NULL,
ADD COLUMN     "posto_policial" BOOLEAN NOT NULL,
ALTER COLUMN "avaliacao_id" SET NOT NULL,
ALTER COLUMN "cameras" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL;

-- DropTable
DROP TABLE "acessoEntorno";

-- DropTable
DROP TABLE "areaAtividades";

-- DropTable
DROP TABLE "avalicao_usuario";

-- DropTable
DROP TABLE "cidade_regiao";

-- DropTable
DROP TABLE "elementosPaisagisticos";

-- DropTable
DROP TABLE "espacosAssento";

-- DropTable
DROP TABLE "feira";

-- DropTable
DROP TABLE "pessoaNoLocal";

-- DropTable
DROP TABLE "segurancaViaria";

-- DropTable
DROP TABLE "usoDensidadeEntorno";

-- DropEnum
DROP TYPE "CategoriasEspacoLivre";

-- DropEnum
DROP TYPE "Dia";

-- DropEnum
DROP TYPE "Tipos_local";

-- DropEnum
DROP TYPE "Tipos_usuario";

-- DropEnum
DROP TYPE "UFederacao";

-- CreateTable
CREATE TABLE "acesso_entorno" (
    "id" SERIAL NOT NULL,
    "cerca_horario_funcionamento" BOOLEAN NOT NULL,
    "placa_identificacao" BOOLEAN NOT NULL,
    "baias_onibus" INTEGER NOT NULL,
    "vagas_taxi" INTEGER NOT NULL,
    "vagas_carro" INTEGER NOT NULL,
    "vagas_moto" INTEGER NOT NULL,
    "ciclovia" BOOLEAN NOT NULL,
    "avaliacao_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acesso_entorno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area_atividades" (
    "id" SERIAL NOT NULL,
    "categoria" INTEGER NOT NULL,
    "sombra_minima" BOOLEAN NOT NULL,
    "iluminacao" BOOLEAN NOT NULL,
    "cercado" BOOLEAN NOT NULL,
    "bancos" BOOLEAN NOT NULL,
    "conservacao" INTEGER NOT NULL,
    "descricao" TEXT,
    "avaliacao_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "area_atividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pessoa_no_local" (
    "id" SERIAL NOT NULL,
    "classificacao_etaria" INTEGER NOT NULL,
    "genero" INTEGER NOT NULL,
    "atividade_fisica" INTEGER NOT NULL,
    "passando" BOOLEAN NOT NULL,
    "pessoa_deficiente" BOOLEAN NOT NULL,
    "atividade_ilicita" BOOLEAN NOT NULL,
    "situacao_rua" BOOLEAN NOT NULL,
    "contagem_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pessoa_no_local_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "elementos_paisagisticos" (
    "id" SERIAL NOT NULL,
    "categoria" INTEGER NOT NULL,
    "sombra_minima" BOOLEAN NOT NULL,
    "iluminacao" BOOLEAN NOT NULL,
    "cercado" BOOLEAN NOT NULL,
    "bancos" BOOLEAN NOT NULL,
    "conservacao" INTEGER NOT NULL,
    "descricao" TEXT,
    "avaliacao_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "elementos_paisagisticos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "espacos_assento" (
    "id" SERIAL NOT NULL,
    "categoria" INTEGER NOT NULL,
    "sombra_minima" BOOLEAN NOT NULL,
    "iluminacao" BOOLEAN NOT NULL,
    "cercado" BOOLEAN NOT NULL,
    "bancos" BOOLEAN NOT NULL,
    "conservacao" INTEGER NOT NULL,
    "avaliacao_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "espacos_assento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos" (
    "id" SERIAL NOT NULL,
    "frequencia_ultimo_ano" INTEGER NOT NULL,
    "categoria" INTEGER NOT NULL,
    "nome_responsavel" VARCHAR(255) NOT NULL,
    "avaliacao_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seguranca_viaria" (
    "id" SERIAL NOT NULL,
    "faixa_pedestre" BOOLEAN NOT NULL,
    "semaforo" BOOLEAN NOT NULL,
    "placas_velocidade" BOOLEAN NOT NULL,
    "avaliacao_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seguranca_viaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uso_densidade_entorno" (
    "id" SERIAL NOT NULL,
    "uso_edificacoes" TEXT NOT NULL,
    "avaliacao_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "uso_densidade_entorno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CidadeToRegiao" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AvaliacaoToUsuario" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "acesso_entorno_avaliacao_id_key" ON "acesso_entorno"("avaliacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "area_atividades_avaliacao_id_key" ON "area_atividades"("avaliacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "elementos_paisagisticos_avaliacao_id_key" ON "elementos_paisagisticos"("avaliacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "espacos_assento_avaliacao_id_key" ON "espacos_assento"("avaliacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "eventos_avaliacao_id_key" ON "eventos"("avaliacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "seguranca_viaria_avaliacao_id_key" ON "seguranca_viaria"("avaliacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "uso_densidade_entorno_avaliacao_id_key" ON "uso_densidade_entorno"("avaliacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "_CidadeToRegiao_AB_unique" ON "_CidadeToRegiao"("A", "B");

-- CreateIndex
CREATE INDEX "_CidadeToRegiao_B_index" ON "_CidadeToRegiao"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AvaliacaoToUsuario_AB_unique" ON "_AvaliacaoToUsuario"("A", "B");

-- CreateIndex
CREATE INDEX "_AvaliacaoToUsuario_B_index" ON "_AvaliacaoToUsuario"("B");

-- AddForeignKey
ALTER TABLE "endereco" ADD CONSTRAINT "endereco_cidade_id_fkey" FOREIGN KEY ("cidade_id") REFERENCES "cidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acessibilidade" ADD CONSTRAINT "acessibilidade_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acesso_entorno" ADD CONSTRAINT "acesso_entorno_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area_atividades" ADD CONSTRAINT "area_atividades_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contagem" ADD CONSTRAINT "contagem_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pessoa_no_local" ADD CONSTRAINT "pessoa_no_local_contagem_id_fkey" FOREIGN KEY ("contagem_id") REFERENCES "contagem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "depredacao" ADD CONSTRAINT "depredacao_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "elementos_paisagisticos" ADD CONSTRAINT "elementos_paisagisticos_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "espacos_assento" ADD CONSTRAINT "espacos_assento_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ruido" ADD CONSTRAINT "ruido_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguranca_viaria" ADD CONSTRAINT "seguranca_viaria_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uso_densidade_entorno" ADD CONSTRAINT "uso_densidade_entorno_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vigilancia" ADD CONSTRAINT "vigilancia_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CidadeToRegiao" ADD CONSTRAINT "_CidadeToRegiao_A_fkey" FOREIGN KEY ("A") REFERENCES "cidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CidadeToRegiao" ADD CONSTRAINT "_CidadeToRegiao_B_fkey" FOREIGN KEY ("B") REFERENCES "regiao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AvaliacaoToUsuario" ADD CONSTRAINT "_AvaliacaoToUsuario_A_fkey" FOREIGN KEY ("A") REFERENCES "avaliacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AvaliacaoToUsuario" ADD CONSTRAINT "_AvaliacaoToUsuario_B_fkey" FOREIGN KEY ("B") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
