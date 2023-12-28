/*
  Warnings:

  - You are about to drop the column `data` on the `avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `dia_semana` on the `avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `fim` on the `avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `inicio` on the `avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `genero` on the `pessoa_no_local` table. All the data in the column will be lost.
  - Changed the type of `conservacao` on the `area_atividades` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `data_fim` to the `avaliacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `data_inicio` to the `avaliacao` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `conservacao_cadeira_movel` on the `avaliacao` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `conservacao_lixeira` on the `avaliacao` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `conservacao_calcada` on the `avaliacao` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `conservacao_banheiro` on the `avaliacao` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `conservacao_telefone_publico` on the `avaliacao` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `conservacao_bebedouro` on the `avaliacao` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `conservacao_obra_arte` on the `avaliacao` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `conservacao_paisagismo_planejado` on the `avaliacao` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `nivel_pichacao` on the `depredacao` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `nivel_abandono` on the `depredacao` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `sexo` to the `pessoa_no_local` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `classificacao_etaria` on the `pessoa_no_local` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `atividade_fisica` on the `pessoa_no_local` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `nivel_visibilidade` on the `vigilancia` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "maintenance" AS ENUM ('terrible', 'poor', 'good', 'great');

-- CreateEnum
CREATE TYPE "upkeep" AS ENUM ('small interference', 'medium interference', 'great interference');

-- CreateEnum
CREATE TYPE "visibility" AS ENUM ('up to 25%', 'up to 50%', 'up to 75%', 'up to 100%');

-- CreateEnum
CREATE TYPE "age_group" AS ENUM ('child', 'teen', 'adult', 'elderly');

-- CreateEnum
CREATE TYPE "atividade" AS ENUM ('sedentario', 'walking', 'strenuous');

-- CreateEnum
CREATE TYPE "sex" AS ENUM ('male', 'female');

-- AlterTable
ALTER TABLE "area_atividades" DROP COLUMN "conservacao",
ADD COLUMN     "conservacao" "maintenance" NOT NULL;

-- AlterTable
ALTER TABLE "avaliacao" DROP COLUMN "data",
DROP COLUMN "dia_semana",
DROP COLUMN "fim",
DROP COLUMN "inicio",
ADD COLUMN     "data_fim" TIMESTAMPTZ NOT NULL,
ADD COLUMN     "data_inicio" TIMESTAMPTZ NOT NULL,
DROP COLUMN "conservacao_cadeira_movel",
ADD COLUMN     "conservacao_cadeira_movel" "maintenance" NOT NULL,
DROP COLUMN "conservacao_lixeira",
ADD COLUMN     "conservacao_lixeira" "maintenance" NOT NULL,
DROP COLUMN "conservacao_calcada",
ADD COLUMN     "conservacao_calcada" "maintenance" NOT NULL,
DROP COLUMN "conservacao_banheiro",
ADD COLUMN     "conservacao_banheiro" "maintenance" NOT NULL,
DROP COLUMN "conservacao_telefone_publico",
ADD COLUMN     "conservacao_telefone_publico" "maintenance" NOT NULL,
DROP COLUMN "conservacao_bebedouro",
ADD COLUMN     "conservacao_bebedouro" "maintenance" NOT NULL,
DROP COLUMN "conservacao_obra_arte",
ADD COLUMN     "conservacao_obra_arte" "maintenance" NOT NULL,
DROP COLUMN "conservacao_paisagismo_planejado",
ADD COLUMN     "conservacao_paisagismo_planejado" "maintenance" NOT NULL;

-- AlterTable
ALTER TABLE "depredacao" DROP COLUMN "nivel_pichacao",
ADD COLUMN     "nivel_pichacao" "upkeep" NOT NULL,
DROP COLUMN "nivel_abandono",
ADD COLUMN     "nivel_abandono" "upkeep" NOT NULL;

-- AlterTable
ALTER TABLE "pessoa_no_local" DROP COLUMN "genero",
ADD COLUMN     "sexo" "sex" NOT NULL,
DROP COLUMN "classificacao_etaria",
ADD COLUMN     "classificacao_etaria" "age_group" NOT NULL,
DROP COLUMN "atividade_fisica",
ADD COLUMN     "atividade_fisica" "atividade" NOT NULL;

-- AlterTable
ALTER TABLE "vigilancia" DROP COLUMN "nivel_visibilidade",
ADD COLUMN     "nivel_visibilidade" "visibility" NOT NULL;

-- DropEnum
DROP TYPE "Maintenance";
