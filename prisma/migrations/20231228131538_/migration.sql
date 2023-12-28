/*
  Warnings:

  - You are about to drop the column `conservacao_cadeira_moveis` on the `avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `conservacao_lixeiras` on the `avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `quantidade_cadeira_moveis` on the `avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `quantidade_lixeiras` on the `avaliacao` table. All the data in the column will be lost.
  - You are about to alter the column `condicao_ceu` on the `contagem` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `regiao` on the `regiao` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - Added the required column `conservacao_cadeira_movel` to the `avaliacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conservacao_lixeira` to the `avaliacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantidade_cadeira_movel` to the `avaliacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantidade_lixeira` to the `avaliacao` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `conservacao_calcada` on the `avaliacao` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `conservacao_banheiro` on the `avaliacao` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `conservacao_telefone_publico` on the `avaliacao` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `conservacao_bebedouro` on the `avaliacao` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `conservacao_obra_arte` on the `avaliacao` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `conservacao_paisagismo_planejado` on the `avaliacao` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `classificacao_etaria` on table `pessoa_no_local` required. This step will fail if there are existing NULL values in that column.
  - Made the column `genero` on table `pessoa_no_local` required. This step will fail if there are existing NULL values in that column.
  - Made the column `atividade_fisica` on table `pessoa_no_local` required. This step will fail if there are existing NULL values in that column.
  - Made the column `passando` on table `pessoa_no_local` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pessoa_deficiente` on table `pessoa_no_local` required. This step will fail if there are existing NULL values in that column.
  - Made the column `atividade_ilicita` on table `pessoa_no_local` required. This step will fail if there are existing NULL values in that column.
  - Made the column `situacao_rua` on table `pessoa_no_local` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Maintenance" AS ENUM ('terrible', 'poor', 'good', 'great');

-- AlterTable
ALTER TABLE "avaliacao" DROP COLUMN "conservacao_cadeira_moveis",
DROP COLUMN "conservacao_lixeiras",
DROP COLUMN "quantidade_cadeira_moveis",
DROP COLUMN "quantidade_lixeiras",
ADD COLUMN     "conservacao_cadeira_movel" "Maintenance" NOT NULL,
ADD COLUMN     "conservacao_lixeira" "Maintenance" NOT NULL,
ADD COLUMN     "quantidade_cadeira_movel" INTEGER NOT NULL,
ADD COLUMN     "quantidade_lixeira" INTEGER NOT NULL,
DROP COLUMN "conservacao_calcada",
ADD COLUMN     "conservacao_calcada" "Maintenance" NOT NULL,
DROP COLUMN "conservacao_banheiro",
ADD COLUMN     "conservacao_banheiro" "Maintenance" NOT NULL,
DROP COLUMN "conservacao_telefone_publico",
ADD COLUMN     "conservacao_telefone_publico" "Maintenance" NOT NULL,
DROP COLUMN "conservacao_bebedouro",
ADD COLUMN     "conservacao_bebedouro" "Maintenance" NOT NULL,
DROP COLUMN "conservacao_obra_arte",
ADD COLUMN     "conservacao_obra_arte" "Maintenance" NOT NULL,
DROP COLUMN "conservacao_paisagismo_planejado",
ADD COLUMN     "conservacao_paisagismo_planejado" "Maintenance" NOT NULL;

-- AlterTable
ALTER TABLE "contagem" ALTER COLUMN "condicao_ceu" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "pessoa_no_local" ALTER COLUMN "classificacao_etaria" SET NOT NULL,
ALTER COLUMN "genero" SET NOT NULL,
ALTER COLUMN "atividade_fisica" SET NOT NULL,
ALTER COLUMN "passando" SET NOT NULL,
ALTER COLUMN "pessoa_deficiente" SET NOT NULL,
ALTER COLUMN "atividade_ilicita" SET NOT NULL,
ALTER COLUMN "situacao_rua" SET NOT NULL;

-- AlterTable
ALTER TABLE "regiao" ALTER COLUMN "regiao" SET DATA TYPE VARCHAR(255);
