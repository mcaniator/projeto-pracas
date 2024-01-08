/*
  Warnings:

  - You are about to drop the column `categoria` on the `seating` table. All the data in the column will be lost.
  - Added the required column `category` to the `seating` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "seating" DROP COLUMN "categoria",
ADD COLUMN     "category" INTEGER NOT NULL;
