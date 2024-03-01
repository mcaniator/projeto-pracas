/*
  Warnings:

  - The values [non-binary] on the enum `gender` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `weather_condition` to the `tally` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "weather_conditions" AS ENUM ('cloudy', 'sunny');

-- AlterEnum
BEGIN;
CREATE TYPE "gender_new" AS ENUM ('male', 'female');
ALTER TABLE "person" ALTER COLUMN "gender" TYPE "gender_new" USING ("gender"::text::"gender_new");
ALTER TYPE "gender" RENAME TO "gender_old";
ALTER TYPE "gender_new" RENAME TO "gender";
DROP TYPE "gender_old";
COMMIT;

-- AlterTable
ALTER TABLE "tally" ADD COLUMN     "observer" VARCHAR(255),
DROP COLUMN "weather_condition",
ADD COLUMN     "weather_condition" "weather_conditions" NOT NULL;
