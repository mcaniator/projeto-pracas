/*
  Warnings:

  - Made the column `temperatura` on table `contagem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `condicao_ceu` on table `contagem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `quantidade_animais` on table `contagem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `adultos` on table `contagem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `atividade_ilicita` on table `contagem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `caminhanho` on table `contagem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `criancas` on table `contagem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `deficientes` on table `contagem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `homens` on table `contagem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `idosos` on table `contagem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `jovens` on table `contagem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `mulheres` on table `contagem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `passando` on table `contagem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pets` on table `contagem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sedentarios` on table `contagem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `situacao_rua` on table `contagem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `vigoroso` on table `contagem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "contagem" ALTER COLUMN "temperatura" SET NOT NULL,
ALTER COLUMN "temperatura" SET DEFAULT 0,
ALTER COLUMN "condicao_ceu" SET NOT NULL,
ALTER COLUMN "condicao_ceu" SET DEFAULT 'Nao informado',
ALTER COLUMN "quantidade_animais" SET NOT NULL,
ALTER COLUMN "quantidade_animais" SET DEFAULT 0,
ALTER COLUMN "adultos" SET NOT NULL,
ALTER COLUMN "adultos" SET DEFAULT 0,
ALTER COLUMN "atividade_ilicita" SET NOT NULL,
ALTER COLUMN "caminhanho" SET NOT NULL,
ALTER COLUMN "caminhanho" SET DEFAULT 0,
ALTER COLUMN "criancas" SET NOT NULL,
ALTER COLUMN "criancas" SET DEFAULT 0,
ALTER COLUMN "deficientes" SET NOT NULL,
ALTER COLUMN "deficientes" SET DEFAULT 0,
ALTER COLUMN "homens" SET NOT NULL,
ALTER COLUMN "homens" SET DEFAULT 0,
ALTER COLUMN "idosos" SET NOT NULL,
ALTER COLUMN "idosos" SET DEFAULT 0,
ALTER COLUMN "jovens" SET NOT NULL,
ALTER COLUMN "jovens" SET DEFAULT 0,
ALTER COLUMN "mulheres" SET NOT NULL,
ALTER COLUMN "mulheres" SET DEFAULT 0,
ALTER COLUMN "passando" SET NOT NULL,
ALTER COLUMN "passando" SET DEFAULT 0,
ALTER COLUMN "pets" SET NOT NULL,
ALTER COLUMN "pets" SET DEFAULT 0,
ALTER COLUMN "sedentarios" SET NOT NULL,
ALTER COLUMN "sedentarios" SET DEFAULT 0,
ALTER COLUMN "situacao_rua" SET NOT NULL,
ALTER COLUMN "vigoroso" SET NOT NULL,
ALTER COLUMN "vigoroso" SET DEFAULT 0;
