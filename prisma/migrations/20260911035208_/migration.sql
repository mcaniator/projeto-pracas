/*
  Warnings:

  - The primary key for the `modular_tally_person_observation_characteristic` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `tally_template_characteristic_id` on the `modular_tally_person_observation_characteristic` table. All the data in the column will be lost.
  - Added the required column `person_characteristic_id` to the `modular_tally_person_observation_characteristic` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "modular_tally_person_observation_characteristic" DROP CONSTRAINT "modular_tally_person_observation_characteristic_tally_temp_fkey";

-- DropIndex
DROP INDEX "modular_tally_person_observation_characteristic_tally_templ_idx";

-- AlterTable
ALTER TABLE "modular_tally_person_observation_characteristic" DROP CONSTRAINT "modular_tally_person_observation_characteristic_pkey",
DROP COLUMN "tally_template_characteristic_id",
ADD COLUMN     "person_characteristic_id" INTEGER NOT NULL,
ADD CONSTRAINT "modular_tally_person_observation_characteristic_pkey" PRIMARY KEY ("modular_tally_person_observation_id", "person_characteristic_id");

-- CreateIndex
CREATE INDEX "modular_tally_person_observation_characteristic_person_char_idx" ON "modular_tally_person_observation_characteristic"("person_characteristic_id");

-- AddForeignKey
ALTER TABLE "modular_tally_person_observation_characteristic" ADD CONSTRAINT "modular_tally_person_observation_characteristic_person_cha_fkey" FOREIGN KEY ("person_characteristic_id") REFERENCES "person_characteristic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
