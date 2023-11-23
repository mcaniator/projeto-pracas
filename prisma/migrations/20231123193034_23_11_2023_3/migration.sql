/*
  Warnings:

  - The `categoriaEspacoLivre` column on the `local` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "local" DROP COLUMN "categoriaEspacoLivre",
ADD COLUMN     "categoriaEspacoLivre" "CategoriasEspacoLivre";
