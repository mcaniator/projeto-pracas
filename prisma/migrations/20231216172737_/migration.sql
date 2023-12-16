/*
  Warnings:

  - The values [ESPACO_LIVRE_PUBLICO_USO_COLETIVO] on the enum `categorias_espaco_livre` will be removed. If these variants are still used in the database, this will fail.
  - The values [Terça Feira,Sábado] on the enum `dia_semana` will be removed. If these variants are still used in the database, this will fail.
  - The values [Amapá,Ceará,Espírito Santo,Goiás,Maranhão,Pará,Paraíba,Paraná,Piauí,Rondônia,São Paulo] on the enum `estados` will be removed. If these variants are still used in the database, this will fail.
  - The values [PRACA] on the enum `tipos_local` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `tipo` on table `local` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "categorias_espaco_livre_new" AS ENUM ('de Praticas Sociais', 'Espaco Livre Privado de Uso Coletivo');
ALTER TABLE "local" ALTER COLUMN "categoria_espaco_livre" TYPE "categorias_espaco_livre_new" USING ("categoria_espaco_livre"::text::"categorias_espaco_livre_new");
ALTER TYPE "categorias_espaco_livre" RENAME TO "categorias_espaco_livre_old";
ALTER TYPE "categorias_espaco_livre_new" RENAME TO "categorias_espaco_livre";
DROP TYPE "categorias_espaco_livre_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "dia_semana_new" AS ENUM ('Domingo', 'Segunda Feira', 'Terca Feira', 'Quarta Feira', 'Quinta Feira', 'Sexta Feira', 'Sabado');
ALTER TABLE "avaliacao" ALTER COLUMN "dia_semana" TYPE "dia_semana_new" USING ("dia_semana"::text::"dia_semana_new");
ALTER TYPE "dia_semana" RENAME TO "dia_semana_old";
ALTER TYPE "dia_semana_new" RENAME TO "dia_semana";
DROP TYPE "dia_semana_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "estados_new" AS ENUM ('Acre', 'Alagoas', 'Amapa', 'Amazonas', 'Bahia', 'Ceara', 'Distrito Federal', 'Espirito Santo', 'Goias', 'Maranhao', 'Matro Grosso', 'Mato Grosso do Sul', 'Minas Gerais', 'Para', 'Paraiba', 'Parana', 'Pernambuco', 'Piaui', 'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondonia', 'Roraima', 'Santa Catarina', 'Sao Paulo', 'Sergipe', 'Tocantins');
ALTER TABLE "endereco" ALTER COLUMN "estado" TYPE "estados_new" USING ("estado"::text::"estados_new");
ALTER TYPE "estados" RENAME TO "estados_old";
ALTER TYPE "estados_new" RENAME TO "estados";
DROP TYPE "estados_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "tipos_local_new" AS ENUM ('Canteiros Centrais e Laterais de Porte', 'Cantos de Quadra', 'Jardim', 'Largo', 'Mirante', 'Praca', 'Praca Cercada', 'Terreno Não Ocupado', 'Terrenos Remanescentes de Sistema Viario/Parcelamento de Solo', 'Rotatorio', 'Trevo');
ALTER TABLE "local" ALTER COLUMN "tipo" TYPE "tipos_local_new" USING ("tipo"::text::"tipos_local_new");
ALTER TYPE "tipos_local" RENAME TO "tipos_local_old";
ALTER TYPE "tipos_local_new" RENAME TO "tipos_local";
DROP TYPE "tipos_local_old";
COMMIT;

-- AlterTable
ALTER TABLE "local" ALTER COLUMN "tipo" SET NOT NULL;
