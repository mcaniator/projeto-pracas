/*
  Warnings:

  - You are about to drop the column `allows_multiple` on the `person_characteristic_group` table. All the data in the column will be lost.
  - You are about to drop the column `default_characteristic_id` on the `tally_template_group` table. All the data in the column will be lost.
  - You are about to drop the column `is_count_axis` on the `tally_template_group` table. All the data in the column will be lost.
  - You are about to drop the column `is_required` on the `tally_template_group` table. All the data in the column will be lost.
  - You are about to drop the column `is_screen_state_selector` on the `tally_template_group` table. All the data in the column will be lost.
  - You are about to drop the `modular_tally_person_observation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `modular_tally_person_observation_characteristic` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "tally_template_group_display_modes" AS ENUM ('DEFAULT', 'COUNTERS', 'SCREEN_CONTEXT_SELECTOR');

-- DropForeignKey
ALTER TABLE "modular_tally_person_observation" DROP CONSTRAINT "modular_tally_person_observation_modular_tally_id_fkey";

-- DropForeignKey
ALTER TABLE "modular_tally_person_observation_characteristic" DROP CONSTRAINT "modular_tally_person_observation_characteristic_modular_ta_fkey";

-- DropForeignKey
ALTER TABLE "modular_tally_person_observation_characteristic" DROP CONSTRAINT "modular_tally_person_observation_characteristic_person_cha_fkey";

-- DropForeignKey
ALTER TABLE "tally_template_group" DROP CONSTRAINT "tally_template_group_default_characteristic_id_fkey";

-- DropIndex
DROP INDEX "tally_template_group_default_characteristic_id_key";

-- AlterTable
ALTER TABLE "person_characteristic_group" DROP COLUMN "allows_multiple",
ADD COLUMN     "is_tag_group" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "tally_template_group" DROP COLUMN "default_characteristic_id",
DROP COLUMN "is_count_axis",
DROP COLUMN "is_required",
DROP COLUMN "is_screen_state_selector",
ADD COLUMN     "display_mode" "tally_template_group_display_modes" NOT NULL DEFAULT 'DEFAULT';

-- DropTable
DROP TABLE "modular_tally_person_observation";

-- DropTable
DROP TABLE "modular_tally_person_observation_characteristic";

-- CreateTable
CREATE TABLE "person_observation" (
    "id" SERIAL NOT NULL,
    "modular_tally_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "person_observation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_observation_characteristic" (
    "person_observation_id" INTEGER NOT NULL,
    "person_characteristic_id" INTEGER NOT NULL,

    CONSTRAINT "person_observation_characteristic_pkey" PRIMARY KEY ("person_observation_id","person_characteristic_id")
);

-- CreateIndex
CREATE INDEX "person_observation_modular_tally_id_idx" ON "person_observation"("modular_tally_id");

-- CreateIndex
CREATE INDEX "person_observation_characteristic_person_characteristic_id_idx" ON "person_observation_characteristic"("person_characteristic_id");

-- AddForeignKey
ALTER TABLE "person_observation" ADD CONSTRAINT "person_observation_modular_tally_id_fkey" FOREIGN KEY ("modular_tally_id") REFERENCES "modular_tally"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_observation_characteristic" ADD CONSTRAINT "person_observation_characteristic_person_observation_id_fkey" FOREIGN KEY ("person_observation_id") REFERENCES "person_observation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_observation_characteristic" ADD CONSTRAINT "person_observation_characteristic_person_characteristic_id_fkey" FOREIGN KEY ("person_characteristic_id") REFERENCES "person_characteristic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
