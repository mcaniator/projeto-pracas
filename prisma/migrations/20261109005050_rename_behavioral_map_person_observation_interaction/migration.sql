/*
  Warnings:

  - You are about to drop the `behavioral_map_person_observation_interaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "behavioral_map_person_observation_interaction" DROP CONSTRAINT "behavioral_map_obs_interaction_obs_a_fkey";

-- DropForeignKey
ALTER TABLE "behavioral_map_person_observation_interaction" DROP CONSTRAINT "behavioral_map_obs_interaction_obs_b_fkey";

-- DropForeignKey
ALTER TABLE "behavioral_map_person_observation_interaction" DROP CONSTRAINT "behavioral_map_person_observation_interaction_behavioral_m_fkey";

-- DropTable
DROP TABLE "behavioral_map_person_observation_interaction";

-- CreateTable
CREATE TABLE "behavioral_map_person_observation_link" (
    "id" SERIAL NOT NULL,
    "behavioral_map_id" INTEGER NOT NULL,
    "observation_a_id" INTEGER NOT NULL,
    "observation_b_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "behavioral_map_person_observation_link_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "behavioral_map_person_observation_link_behavioral_map_id_idx" ON "behavioral_map_person_observation_link"("behavioral_map_id");

-- CreateIndex
CREATE INDEX "behavioral_map_person_observation_link_observation_a_id_idx" ON "behavioral_map_person_observation_link"("observation_a_id");

-- CreateIndex
CREATE INDEX "behavioral_map_person_observation_link_observation_b_id_idx" ON "behavioral_map_person_observation_link"("observation_b_id");

-- AddForeignKey
ALTER TABLE "behavioral_map_person_observation_link" ADD CONSTRAINT "behavioral_map_person_observation_link_behavioral_map_id_fkey" FOREIGN KEY ("behavioral_map_id") REFERENCES "behavioral_map"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavioral_map_person_observation_link" ADD CONSTRAINT "behavioral_map_obs_link_obs_a_fkey" FOREIGN KEY ("observation_a_id") REFERENCES "behavioral_map_person_observation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavioral_map_person_observation_link" ADD CONSTRAINT "behavioral_map_obs_link_obs_b_fkey" FOREIGN KEY ("observation_b_id") REFERENCES "behavioral_map_person_observation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
