/*
  Warnings:

  - You are about to drop the column `form_version` on the `Assessment` table. All the data in the column will be lost.
  - Added the required column `form_version` to the `response` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Assessment" DROP COLUMN "form_version";

-- AlterTable
ALTER TABLE "response" ADD COLUMN     "form_version" INTEGER NOT NULL;
