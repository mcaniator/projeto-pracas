/*
  Warnings:

  - You are about to drop the column `form_id` on the `response` table. All the data in the column will be lost.
  - You are about to drop the column `form_version` on the `response` table. All the data in the column will be lost.
  - You are about to drop the column `location_id` on the `response` table. All the data in the column will be lost.
  - You are about to drop the column `form_id` on the `response_option` table. All the data in the column will be lost.
  - You are about to drop the column `form_version` on the `response_option` table. All the data in the column will be lost.
  - You are about to drop the column `location_id` on the `response_option` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `response` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `response_option` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "response" DROP CONSTRAINT "response_form_id_fkey";

-- DropForeignKey
ALTER TABLE "response" DROP CONSTRAINT "response_location_id_fkey";

-- DropForeignKey
ALTER TABLE "response_option" DROP CONSTRAINT "response_option_form_id_fkey";

-- DropForeignKey
ALTER TABLE "response_option" DROP CONSTRAINT "response_option_location_id_fkey";

-- AlterTable
ALTER TABLE "response" DROP COLUMN "form_id",
DROP COLUMN "form_version",
DROP COLUMN "location_id",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "response_option" DROP COLUMN "form_id",
DROP COLUMN "form_version",
DROP COLUMN "location_id",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
