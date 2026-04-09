/*
  Warnings:

  - Made the column `username` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
UPDATE "user" SET "username" = LEFT(split_part(email, '@', 1), 30)  WHERE "username" IS NULL;
ALTER TABLE "user" ALTER COLUMN "username" SET NOT NULL;
