/*
  Warnings:

  - Changed the type of `category` on the `noise` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "noise_categories" AS ENUM ('unknown', 'cars');

-- AlterTable
ALTER TABLE "noise" DROP COLUMN "category",
ADD COLUMN     "category" "noise_categories" NOT NULL;
