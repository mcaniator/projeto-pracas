/*
  Warnings:

  - You are about to drop the column `tally_id` on the `person` table. All the data in the column will be lost.
  - You are about to alter the column `username` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - A unique constraint covering the columns `[age_group,gender,activity,is_traversing,is_person_with_impairment,is_in_apparent_illicit_activity,is_person_without_housing]` on the table `person` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "person" DROP CONSTRAINT "person_tally_id_fkey";

-- AlterTable
ALTER TABLE "person" DROP COLUMN "tally_id";

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "username" SET DATA TYPE VARCHAR(255);

-- CreateTable
CREATE TABLE "tally_person" (
    "id" SERIAL NOT NULL,
    "tally_id" INTEGER NOT NULL,
    "person_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "tally_person_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tally_person_tally_id_person_id_key" ON "tally_person"("tally_id", "person_id");

-- CreateIndex
CREATE UNIQUE INDEX "person_age_group_gender_activity_is_traversing_is_person_wi_key" ON "person"("age_group", "gender", "activity", "is_traversing", "is_person_with_impairment", "is_in_apparent_illicit_activity", "is_person_without_housing");

-- AddForeignKey
ALTER TABLE "tally_person" ADD CONSTRAINT "tally_person_tally_id_fkey" FOREIGN KEY ("tally_id") REFERENCES "tally"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tally_person" ADD CONSTRAINT "tally_person_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
