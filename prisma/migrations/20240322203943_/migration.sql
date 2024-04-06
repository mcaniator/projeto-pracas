/*
  Warnings:

  - You are about to drop the `_FormToLocation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_FormToLocation" DROP CONSTRAINT "_FormToLocation_A_fkey";

-- DropForeignKey
ALTER TABLE "_FormToLocation" DROP CONSTRAINT "_FormToLocation_B_fkey";

-- AlterTable
ALTER TABLE "location" ADD COLUMN     "formId" INTEGER;

-- DropTable
DROP TABLE "_FormToLocation";

-- AddForeignKey
ALTER TABLE "location" ADD CONSTRAINT "location_formId_fkey" FOREIGN KEY ("formId") REFERENCES "form"("id") ON DELETE SET NULL ON UPDATE CASCADE;
