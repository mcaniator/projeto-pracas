/*
  Warnings:

  - You are about to drop the `address` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `firstStreet` to the `location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secondStreet` to the `location` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "address" DROP CONSTRAINT "address_location_id_fkey";

-- AlterTable
ALTER TABLE "location" ADD COLUMN     "firstStreet" VARCHAR(255) NOT NULL,
ADD COLUMN     "secondStreet" VARCHAR(255) NOT NULL;

-- DropTable
DROP TABLE "address";
