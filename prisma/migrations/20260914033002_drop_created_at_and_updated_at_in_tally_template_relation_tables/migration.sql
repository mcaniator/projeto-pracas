/*
  Warnings:

  - You are about to drop the column `created_at` on the `tally_template_characteristic` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `tally_template_characteristic` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `tally_template_group` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `tally_template_group` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tally_template_characteristic" DROP COLUMN "created_at",
DROP COLUMN "updated_at";

-- AlterTable
ALTER TABLE "tally_template_group" DROP COLUMN "created_at",
DROP COLUMN "updated_at";
