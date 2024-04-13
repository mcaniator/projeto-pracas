-- AlterTable
ALTER TABLE "tally" ADD COLUMN     "tally_group" INTEGER,
ALTER COLUMN "weather_condition" DROP NOT NULL;
