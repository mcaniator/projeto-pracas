/*
  Warnings:

  - You are about to drop the `person` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "person" DROP CONSTRAINT "person_tally_id_fkey";

-- DropTable
DROP TABLE "person";

-- CreateTable
CREATE TABLE "people" (
    "id" SERIAL NOT NULL,
    "age_group" "age_group" NOT NULL,
    "sex" "sex" NOT NULL,
    "activity" "atividade" NOT NULL,
    "is_traversing" BOOLEAN NOT NULL,
    "is_impaired_person" BOOLEAN NOT NULL,
    "is_in_apparent_illicit_activity" BOOLEAN NOT NULL,
    "is_homeless" BOOLEAN NOT NULL,
    "tally_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "people_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "people" ADD CONSTRAINT "people_tally_id_fkey" FOREIGN KEY ("tally_id") REFERENCES "tally"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
