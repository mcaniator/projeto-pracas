-- AlterTable
ALTER TABLE "location" ADD COLUMN     "household_density" VARCHAR(255),
ADD COLUMN     "income" VARCHAR(255),
ADD COLUMN     "men" INTEGER,
ADD COLUMN     "occupied_households" INTEGER,
ADD COLUMN     "women" INTEGER;
