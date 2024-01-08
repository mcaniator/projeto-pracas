/*
  Warnings:

  - You are about to drop the `pessoa_no_local` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "pessoa_no_local" DROP CONSTRAINT "pessoa_no_local_contagem_id_fkey";

-- DropTable
DROP TABLE "pessoa_no_local";
