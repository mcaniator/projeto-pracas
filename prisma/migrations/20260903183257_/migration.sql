/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `custom_icon` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "custom_icon" ALTER COLUMN "aliases" SET DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "custom_icon_name_key" ON "custom_icon"("name");
