/*
  Warnings:

  - You are about to drop the column `modular_tally_id` on the `person_observation` table. All the data in the column will be lost.
  - You are about to drop the `modular_tally` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `modular_tally_template` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tally_template_characteristic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tally_template_group` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `tally_id` to the `person_observation` table without a default value. This is not possible if the table is not empty.

*/
-- Delete data
DELETE FROM "person_observation";

-- CreateEnum
CREATE TYPE "tally_protocol_group_display_modes" AS ENUM ('COMMON', 'COUNTERS', 'SCREEN_CONTEXT_SELECTOR');

-- DropForeignKey
ALTER TABLE "modular_tally" DROP CONSTRAINT "modular_tally_form_submission_id_fkey";

-- DropForeignKey
ALTER TABLE "modular_tally" DROP CONSTRAINT "modular_tally_location_id_fkey";

-- DropForeignKey
ALTER TABLE "modular_tally" DROP CONSTRAINT "modular_tally_modular_tally_template_id_fkey";

-- DropForeignKey
ALTER TABLE "modular_tally" DROP CONSTRAINT "modular_tally_user_id_fkey";

-- DropForeignKey
ALTER TABLE "modular_tally_template" DROP CONSTRAINT "modular_tally_template_form_id_fkey";

-- DropForeignKey
ALTER TABLE "person_observation" DROP CONSTRAINT "person_observation_modular_tally_id_fkey";

-- DropForeignKey
ALTER TABLE "tally_template_characteristic" DROP CONSTRAINT "tally_template_characteristic_person_characteristic_id_fkey";

-- DropForeignKey
ALTER TABLE "tally_template_characteristic" DROP CONSTRAINT "tally_template_characteristic_tally_template_group_id_fkey";

-- DropForeignKey
ALTER TABLE "tally_template_group" DROP CONSTRAINT "tally_template_group_modular_tally_template_id_fkey";

-- DropForeignKey
ALTER TABLE "tally_template_group" DROP CONSTRAINT "tally_template_group_person_characteristic_group_id_fkey";

-- DropIndex
DROP INDEX "person_observation_modular_tally_id_idx";

-- AlterTable
ALTER TABLE "person_observation" DROP COLUMN "modular_tally_id",
ADD COLUMN     "tally_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "modular_tally";

-- DropTable
DROP TABLE "modular_tally_template";

-- DropTable
DROP TABLE "tally_template_characteristic";

-- DropTable
DROP TABLE "tally_template_group";

-- DropEnum
DROP TYPE "tally_template_group_display_modes";

-- CreateTable
CREATE TABLE "tally_protocol" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "finalized" BOOLEAN NOT NULL DEFAULT false,
    "form_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tally_protocol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tally_protocol_group" (
    "id" SERIAL NOT NULL,
    "tally_protocol_id" INTEGER NOT NULL,
    "person_characteristic_group_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "display_mode" "tally_protocol_group_display_modes" NOT NULL,

    CONSTRAINT "tally_protocol_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tally_protocol_characteristic" (
    "id" SERIAL NOT NULL,
    "tally_protocol_group_id" INTEGER NOT NULL,
    "person_characteristic_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "tally_protocol_characteristic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tally" (
    "id" SERIAL NOT NULL,
    "start_date" TIMESTAMPTZ(0) NOT NULL,
    "end_date" TIMESTAMPTZ(0),
    "is_finalized" BOOLEAN NOT NULL DEFAULT false,
    "user_id" VARCHAR(255) NOT NULL,
    "location_id" INTEGER NOT NULL,
    "tally_protocol_id" INTEGER NOT NULL,
    "form_submission_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tally_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tally_protocol_group_person_characteristic_group_id_idx" ON "tally_protocol_group"("person_characteristic_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "tally_protocol_group_tally_protocol_id_person_characteristi_key" ON "tally_protocol_group"("tally_protocol_id", "person_characteristic_group_id");

-- CreateIndex
CREATE INDEX "tally_protocol_characteristic_person_characteristic_id_idx" ON "tally_protocol_characteristic"("person_characteristic_id");

-- CreateIndex
CREATE UNIQUE INDEX "tally_protocol_characteristic_tally_protocol_group_id_perso_key" ON "tally_protocol_characteristic"("tally_protocol_group_id", "person_characteristic_id");

-- CreateIndex
CREATE UNIQUE INDEX "tally_protocol_characteristic_tally_protocol_group_id_posit_key" ON "tally_protocol_characteristic"("tally_protocol_group_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "tally_form_submission_id_key" ON "tally"("form_submission_id");

-- CreateIndex
CREATE INDEX "tally_user_id_idx" ON "tally"("user_id");

-- CreateIndex
CREATE INDEX "tally_location_id_idx" ON "tally"("location_id");

-- CreateIndex
CREATE INDEX "tally_tally_protocol_id_idx" ON "tally"("tally_protocol_id");

-- CreateIndex
CREATE INDEX "person_observation_tally_id_idx" ON "person_observation"("tally_id");

-- AddForeignKey
ALTER TABLE "tally_protocol" ADD CONSTRAINT "tally_protocol_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "form"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tally_protocol_group" ADD CONSTRAINT "tally_protocol_group_tally_protocol_id_fkey" FOREIGN KEY ("tally_protocol_id") REFERENCES "tally_protocol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tally_protocol_group" ADD CONSTRAINT "tally_protocol_group_person_characteristic_group_id_fkey" FOREIGN KEY ("person_characteristic_group_id") REFERENCES "person_characteristic_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tally_protocol_characteristic" ADD CONSTRAINT "tally_protocol_characteristic_tally_protocol_group_id_fkey" FOREIGN KEY ("tally_protocol_group_id") REFERENCES "tally_protocol_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tally_protocol_characteristic" ADD CONSTRAINT "tally_protocol_characteristic_person_characteristic_id_fkey" FOREIGN KEY ("person_characteristic_id") REFERENCES "person_characteristic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tally" ADD CONSTRAINT "tally_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tally" ADD CONSTRAINT "tally_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tally" ADD CONSTRAINT "tally_tally_protocol_id_fkey" FOREIGN KEY ("tally_protocol_id") REFERENCES "tally_protocol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tally" ADD CONSTRAINT "tally_form_submission_id_fkey" FOREIGN KEY ("form_submission_id") REFERENCES "form_submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_observation" ADD CONSTRAINT "person_observation_tally_id_fkey" FOREIGN KEY ("tally_id") REFERENCES "tally"("id") ON DELETE CASCADE ON UPDATE CASCADE;
