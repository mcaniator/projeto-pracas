-- CreateEnum
CREATE TYPE "image_hosts" AS ENUM ('IMAGEKIT', 'DRIVE');

-- AlterTable
ALTER TABLE "image" ADD COLUMN     "host" "image_hosts";
UPDATE "image" SET "host" = 'IMAGEKIT';
ALTER TABLE "image" ALTER COLUMN "host" SET NOT NULL;
ALTER TABLE "image" ALTER COLUMN "size" DROP NOT NULL;

-- CreateTable
CREATE TABLE "image_response" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "assessment_id" INTEGER NOT NULL,
    "image_id" INTEGER NOT NULL,

    CONSTRAINT "image_response_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "image_response_image_id_key" ON "image_response"("image_id");

-- AddForeignKey
ALTER TABLE "image_response" ADD CONSTRAINT "image_response_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image_response" ADD CONSTRAINT "image_response_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image_response" ADD CONSTRAINT "image_response_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "image"("image_id") ON DELETE RESTRICT ON UPDATE CASCADE;
