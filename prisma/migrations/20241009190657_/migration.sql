/*
  Warnings:

  - Added the required column `has_associated_geometry` to the `question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "question" ADD COLUMN     "has_associated_geometry" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "response" ADD COLUMN     "geometry" Geometry;

-- AlterTable
ALTER TABLE "response_option" ADD COLUMN     "geometry" Geometry;
