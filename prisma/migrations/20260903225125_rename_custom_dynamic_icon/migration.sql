/*
  Warnings:

  - You are about to drop the `custom_icon` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "custom_icon";

-- CreateTable
CREATE TABLE "custom_dynamic_icon" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "body" TEXT NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "custom_dynamic_icon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "custom_dynamic_icon_name_key" ON "custom_dynamic_icon"("name");

-- CreateIndex
CREATE INDEX "custom_dynamic_icon_name_idx" ON "custom_dynamic_icon"("name");

-- CreateIndex
CREATE INDEX "custom_dynamic_icon_aliases_idx" ON "custom_dynamic_icon"("aliases");
