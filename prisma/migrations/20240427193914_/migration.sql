/*
  Warnings:

  - You are about to drop the column `location` on the `noise` table. All the data in the column will be lost.
  - Added the required column `date` to the `noise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `noise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `noise_type` to the `noise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `predominantSound` to the `noise` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NoiseTypes" AS ENUM ('traffic_or_Machines', 'human', 'biophony', 'geophony', 'others');

-- AlterTable
ALTER TABLE "noise" DROP COLUMN "location",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "description" VARCHAR(255) NOT NULL,
ADD COLUMN     "noise_type" "NoiseTypes" NOT NULL,
ADD COLUMN     "predominantSound" VARCHAR(255) NOT NULL,
ALTER COLUMN "updated_at" DROP NOT NULL;

-- DropEnum
DROP TYPE "noise_categories";
