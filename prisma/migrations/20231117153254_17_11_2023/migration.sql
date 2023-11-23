/*
  Warnings:

  - The `diaSemana` column on the `avaliacao` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `UF` column on the `endereco` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `regiaoUrbana` on the `local` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `VarChar(255)`.

*/
-- CreateEnum
CREATE TYPE "Dia" AS ENUM ('DOMINGO', 'SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO');

-- CreateEnum
CREATE TYPE "UFederacao" AS ENUM ('AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO');

-- AlterTable
ALTER TABLE "avaliacao" DROP COLUMN "diaSemana",
ADD COLUMN     "diaSemana" "Dia";

-- AlterTable
ALTER TABLE "endereco" DROP COLUMN "UF",
ADD COLUMN     "UF" "UFederacao";

-- AlterTable
ALTER TABLE "local" ALTER COLUMN "regiaoUrbana" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "poligonoArea" DROP NOT NULL;
