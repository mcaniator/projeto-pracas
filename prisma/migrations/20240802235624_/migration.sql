/*
  Warnings:

  - Added the required column `form_version` to the `response` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `response` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "response" ADD COLUMN     "form_version" INTEGER NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "response" ADD CONSTRAINT "response_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
