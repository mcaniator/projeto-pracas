/*
  Warnings:

  - You are about to drop the column `formId` on the `location` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "location" DROP CONSTRAINT "location_formId_fkey";

-- AlterTable
ALTER TABLE "location" DROP COLUMN "formId";

-- CreateTable
CREATE TABLE "_FormToLocation" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_FormToLocation_AB_unique" ON "_FormToLocation"("A", "B");

-- CreateIndex
CREATE INDEX "_FormToLocation_B_index" ON "_FormToLocation"("B");

-- AddForeignKey
ALTER TABLE "_FormToLocation" ADD CONSTRAINT "_FormToLocation_A_fkey" FOREIGN KEY ("A") REFERENCES "form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FormToLocation" ADD CONSTRAINT "_FormToLocation_B_fkey" FOREIGN KEY ("B") REFERENCES "location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
