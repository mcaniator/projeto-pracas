/*
  Warnings:

  - You are about to drop the column `name` on the `broad_administrative_unit` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `intermediate_administrative_unit` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `narrow_administrative_unit` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[city_id,name3]` on the table `broad_administrative_unit` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[city_id,name2]` on the table `intermediate_administrative_unit` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[city_id,name1]` on the table `narrow_administrative_unit` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name3` to the `broad_administrative_unit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name2` to the `intermediate_administrative_unit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name1` to the `narrow_administrative_unit` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "broad_administrative_unit_city_id_name_key";

-- DropIndex
DROP INDEX "intermediate_administrative_unit_city_id_name_key";

-- DropIndex
DROP INDEX "narrow_administrative_unit_city_id_name_key";

-- AlterTable
ALTER TABLE "broad_administrative_unit" DROP COLUMN "name",
ADD COLUMN     "name3" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "intermediate_administrative_unit" DROP COLUMN "name",
ADD COLUMN     "name2" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "narrow_administrative_unit" DROP COLUMN "name",
ADD COLUMN     "name1" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "broad_administrative_unit_city_id_name3_key" ON "broad_administrative_unit"("city_id", "name3");

-- CreateIndex
CREATE UNIQUE INDEX "intermediate_administrative_unit_city_id_name2_key" ON "intermediate_administrative_unit"("city_id", "name2");

-- CreateIndex
CREATE UNIQUE INDEX "narrow_administrative_unit_city_id_name1_key" ON "narrow_administrative_unit"("city_id", "name1");
