-- CreateEnum
CREATE TYPE "Morphology" AS ENUM ('CORNER', 'CENTER', 'ISOLATED', 'DIVIDED');

-- AlterTable
ALTER TABLE "location" ADD COLUMN     "morphology" "Morphology",
ADD COLUMN     "streets_10m_wide" INTEGER,
ADD COLUMN     "streets_20m_wide" INTEGER,
ADD COLUMN     "streets_4m_wide" INTEGER,
ADD COLUMN     "streets_6m_wide" INTEGER,
ADD COLUMN     "streets_8m_wide" INTEGER;
