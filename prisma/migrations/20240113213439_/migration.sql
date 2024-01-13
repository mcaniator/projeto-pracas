/*
  Warnings:

  - You are about to drop the column `adults` on the `tally` table. All the data in the column will be lost.
  - You are about to drop the column `apparent_illicit_activity` on the `tally` table. All the data in the column will be lost.
  - You are about to drop the column `children` on the `tally` table. All the data in the column will be lost.
  - You are about to drop the column `elders` on the `tally` table. All the data in the column will be lost.
  - You are about to drop the column `homeless` on the `tally` table. All the data in the column will be lost.
  - You are about to drop the column `impaired` on the `tally` table. All the data in the column will be lost.
  - You are about to drop the column `juveniles` on the `tally` table. All the data in the column will be lost.
  - You are about to drop the column `men` on the `tally` table. All the data in the column will be lost.
  - You are about to drop the column `pets` on the `tally` table. All the data in the column will be lost.
  - You are about to drop the column `sedentary` on the `tally` table. All the data in the column will be lost.
  - You are about to drop the column `traversing` on the `tally` table. All the data in the column will be lost.
  - You are about to drop the column `vigorous` on the `tally` table. All the data in the column will be lost.
  - You are about to drop the column `walking` on the `tally` table. All the data in the column will be lost.
  - You are about to drop the column `women` on the `tally` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tally" DROP COLUMN "adults",
DROP COLUMN "apparent_illicit_activity",
DROP COLUMN "children",
DROP COLUMN "elders",
DROP COLUMN "homeless",
DROP COLUMN "impaired",
DROP COLUMN "juveniles",
DROP COLUMN "men",
DROP COLUMN "pets",
DROP COLUMN "sedentary",
DROP COLUMN "traversing",
DROP COLUMN "vigorous",
DROP COLUMN "walking",
DROP COLUMN "women";

-- CreateTable
CREATE TABLE "person" (
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

    CONSTRAINT "person_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "person" ADD CONSTRAINT "person_tally_id_fkey" FOREIGN KEY ("tally_id") REFERENCES "tally"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
