/*
  Warnings:

  - The `tipo` column on the `local` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `tipo` column on the `usuario` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Tipos_local" AS ENUM ('PRACA');

-- CreateEnum
CREATE TYPE "Tipos_usuario" AS ENUM ('ADMIN', 'PESQUISADOR');

-- AlterTable
ALTER TABLE "local" DROP COLUMN "tipo",
ADD COLUMN     "tipo" "Tipos_local";

-- AlterTable
ALTER TABLE "usuario" DROP COLUMN "tipo",
ADD COLUMN     "tipo" "Tipos_usuario";

-- DropEnum
DROP TYPE "Tipos";
