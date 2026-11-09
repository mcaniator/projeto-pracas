/*
  Warnings:

  - You are about to drop the column `behavioral_map_group_id` on the `behavioral_map_person_observation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "behavioral_map_person_observation" DROP CONSTRAINT "behavioral_map_person_observation_behavioral_map_group_id_fkey";

-- DropIndex
DROP INDEX "behavioral_map_person_observation_behavioral_map_group_id_idx";

-- AlterTable
ALTER TABLE "behavioral_map_person_observation" DROP COLUMN "behavioral_map_group_id";

-- CreateTable
CREATE TABLE "behavioral_map_person_observation_group" (
    "behavioral_map_group_id" INTEGER NOT NULL,
    "person_observation_id" INTEGER NOT NULL,

    CONSTRAINT "behavioral_map_person_observation_group_pkey" PRIMARY KEY ("behavioral_map_group_id","person_observation_id")
);

-- CreateIndex
CREATE INDEX "behavioral_map_person_observation_group_person_observation__idx" ON "behavioral_map_person_observation_group"("person_observation_id");

-- AddForeignKey
ALTER TABLE "behavioral_map_person_observation_group" ADD CONSTRAINT "behavioral_map_person_observation_group_behavioral_map_gro_fkey" FOREIGN KEY ("behavioral_map_group_id") REFERENCES "behavioral_map_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavioral_map_person_observation_group" ADD CONSTRAINT "behavioral_map_person_observation_group_person_observation_fkey" FOREIGN KEY ("person_observation_id") REFERENCES "behavioral_map_person_observation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
