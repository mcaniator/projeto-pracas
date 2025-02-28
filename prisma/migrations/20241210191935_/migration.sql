/*
  Warnings:

  - A unique constraint covering the columns `[name,version]` on the table `form` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "form_name_version_key" ON "form"("name", "version");
