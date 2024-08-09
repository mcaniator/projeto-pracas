/*
  Warnings:

  - You are about to drop the column `frequency` on the `response` table. All the data in the column will be lost.
  - You are about to drop the column `observer` on the `tally` table. All the data in the column will be lost.
  - You are about to drop the column `assessment_id` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `responseOption` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `form_version` to the `response` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `response` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `tally` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "responseOption" DROP CONSTRAINT "responseOption_form_id_fkey";

-- DropForeignKey
ALTER TABLE "responseOption" DROP CONSTRAINT "responseOption_location_id_fkey";

-- DropForeignKey
ALTER TABLE "responseOption" DROP CONSTRAINT "responseOption_option_id_fkey";

-- DropForeignKey
ALTER TABLE "responseOption" DROP CONSTRAINT "responseOption_question_id_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_assessment_id_fkey";

-- AlterTable
ALTER TABLE "question" ADD COLUMN     "subcategory_id" INTEGER;

-- AlterTable
ALTER TABLE "response" DROP COLUMN "frequency",
ADD COLUMN     "form_version" INTEGER NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tally" DROP COLUMN "observer",
ADD COLUMN     "user_id" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "assessment_id";

-- DropTable
DROP TABLE "responseOption";

-- CreateTable
CREATE TABLE "subcategory" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "optional" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "subcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "response_option" (
    "id" SERIAL NOT NULL,
    "location_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "form_id" INTEGER NOT NULL,
    "form_version" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "option_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "response_option_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "subcategory" ADD CONSTRAINT "subcategory_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "subcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response" ADD CONSTRAINT "response_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_option" ADD CONSTRAINT "response_option_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_option" ADD CONSTRAINT "response_option_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_option" ADD CONSTRAINT "response_option_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_option" ADD CONSTRAINT "response_option_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_option" ADD CONSTRAINT "response_option_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "option"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tally" ADD CONSTRAINT "tally_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
