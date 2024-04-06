-- DropForeignKey
ALTER TABLE "classification" DROP CONSTRAINT "classification_parentId_fkey";

-- AlterTable
ALTER TABLE "classification" ALTER COLUMN "parentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "classification" ADD CONSTRAINT "classification_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "classification"("id") ON DELETE SET NULL ON UPDATE CASCADE;
