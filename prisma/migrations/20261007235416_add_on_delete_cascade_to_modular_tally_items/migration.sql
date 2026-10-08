-- DropForeignKey
ALTER TABLE "person_observation" DROP CONSTRAINT "person_observation_modular_tally_id_fkey";

-- DropForeignKey
ALTER TABLE "person_observation_characteristic" DROP CONSTRAINT "person_observation_characteristic_person_observation_id_fkey";

-- AddForeignKey
ALTER TABLE "person_observation" ADD CONSTRAINT "person_observation_modular_tally_id_fkey" FOREIGN KEY ("modular_tally_id") REFERENCES "modular_tally"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_observation_characteristic" ADD CONSTRAINT "person_observation_characteristic_person_observation_id_fkey" FOREIGN KEY ("person_observation_id") REFERENCES "person_observation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
