/*
  Warnings:

  - You are about to drop the `_DelimitacaoAdministrativa1ToLocal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_DelimitacaoAdministrativa2ToLocal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_DelimitacaoAdministrativa3ToLocal` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `delimitacao_administrativa_1_id` to the `local` table without a default value. This is not possible if the table is not empty.
  - Added the required column `delimitacao_administrativa_2_id` to the `local` table without a default value. This is not possible if the table is not empty.
  - Added the required column `delimitacao_administrativa_3_id` to the `local` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_DelimitacaoAdministrativa1ToLocal" DROP CONSTRAINT "_DelimitacaoAdministrativa1ToLocal_A_fkey";

-- DropForeignKey
ALTER TABLE "_DelimitacaoAdministrativa1ToLocal" DROP CONSTRAINT "_DelimitacaoAdministrativa1ToLocal_B_fkey";

-- DropForeignKey
ALTER TABLE "_DelimitacaoAdministrativa2ToLocal" DROP CONSTRAINT "_DelimitacaoAdministrativa2ToLocal_A_fkey";

-- DropForeignKey
ALTER TABLE "_DelimitacaoAdministrativa2ToLocal" DROP CONSTRAINT "_DelimitacaoAdministrativa2ToLocal_B_fkey";

-- DropForeignKey
ALTER TABLE "_DelimitacaoAdministrativa3ToLocal" DROP CONSTRAINT "_DelimitacaoAdministrativa3ToLocal_A_fkey";

-- DropForeignKey
ALTER TABLE "_DelimitacaoAdministrativa3ToLocal" DROP CONSTRAINT "_DelimitacaoAdministrativa3ToLocal_B_fkey";

-- AlterTable
ALTER TABLE "local" ADD COLUMN     "delimitacao_administrativa_1_id" INTEGER NOT NULL,
ADD COLUMN     "delimitacao_administrativa_2_id" INTEGER NOT NULL,
ADD COLUMN     "delimitacao_administrativa_3_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_DelimitacaoAdministrativa1ToLocal";

-- DropTable
DROP TABLE "_DelimitacaoAdministrativa2ToLocal";

-- DropTable
DROP TABLE "_DelimitacaoAdministrativa3ToLocal";

-- AddForeignKey
ALTER TABLE "local" ADD CONSTRAINT "local_delimitacao_administrativa_1_id_fkey" FOREIGN KEY ("delimitacao_administrativa_1_id") REFERENCES "delimitacao_administrativa_1"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "local" ADD CONSTRAINT "local_delimitacao_administrativa_2_id_fkey" FOREIGN KEY ("delimitacao_administrativa_2_id") REFERENCES "delimitacao_administrativa_2"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "local" ADD CONSTRAINT "local_delimitacao_administrativa_3_id_fkey" FOREIGN KEY ("delimitacao_administrativa_3_id") REFERENCES "delimitacao_administrativa_3"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
