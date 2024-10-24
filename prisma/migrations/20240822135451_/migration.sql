/*
  Warnings:

  - You are about to drop the column `artwork_amount` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `artwork_condition` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `bathroom_amount` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `bathroom_condition` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `changed_delimitation` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `drinking_fountain_amount` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `drinking_fountain_condition` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `has_wifi` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `movable_seats_amount` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `movable_seats_condition` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `paved_sidewalk` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `payphone_amount` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `payphone_condition` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `planned_landscaping_amount` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `planned_landscaping_condition` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `sidewalk_condition` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `trash_can_amount` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `trash_can_condition` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `assessment_id` on the `noise` table. All the data in the column will be lost.
  - You are about to drop the `accessibility` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `activities_area` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `destruction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `events` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `landscaping` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `seating` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `security` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `surrounding_activity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `surrounding_area` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `traffic_safety` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `form_id` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `form_version` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assessment_id` to the `response` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assessment_id` to the `response_option` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "accessibility" DROP CONSTRAINT "accessibility_assessment_id_fkey";

-- DropForeignKey
ALTER TABLE "activities_area" DROP CONSTRAINT "activities_area_assessment_id_fkey";

-- DropForeignKey
ALTER TABLE "destruction" DROP CONSTRAINT "destruction_assessment_id_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_assessment_id_fkey";

-- DropForeignKey
ALTER TABLE "landscaping" DROP CONSTRAINT "landscaping_assessment_id_fkey";

-- DropForeignKey
ALTER TABLE "noise" DROP CONSTRAINT "noise_assessment_id_fkey";

-- DropForeignKey
ALTER TABLE "seating" DROP CONSTRAINT "seating_assessment_id_fkey";

-- DropForeignKey
ALTER TABLE "security" DROP CONSTRAINT "security_assessment_id_fkey";

-- DropForeignKey
ALTER TABLE "surrounding_activity" DROP CONSTRAINT "surrounding_activity_assessment_id_fkey";

-- DropForeignKey
ALTER TABLE "surrounding_area" DROP CONSTRAINT "surrounding_area_assessment_id_fkey";

-- DropForeignKey
ALTER TABLE "traffic_safety" DROP CONSTRAINT "traffic_safety_assessment_id_fkey";

-- AlterTable
ALTER TABLE "Assessment" DROP COLUMN "artwork_amount",
DROP COLUMN "artwork_condition",
DROP COLUMN "bathroom_amount",
DROP COLUMN "bathroom_condition",
DROP COLUMN "changed_delimitation",
DROP COLUMN "drinking_fountain_amount",
DROP COLUMN "drinking_fountain_condition",
DROP COLUMN "has_wifi",
DROP COLUMN "movable_seats_amount",
DROP COLUMN "movable_seats_condition",
DROP COLUMN "paved_sidewalk",
DROP COLUMN "payphone_amount",
DROP COLUMN "payphone_condition",
DROP COLUMN "planned_landscaping_amount",
DROP COLUMN "planned_landscaping_condition",
DROP COLUMN "sidewalk_condition",
DROP COLUMN "trash_can_amount",
DROP COLUMN "trash_can_condition",
ADD COLUMN     "form_id" INTEGER NOT NULL,
ADD COLUMN     "form_version" INTEGER NOT NULL,
ADD COLUMN     "userId" VARCHAR(255) NOT NULL,
ALTER COLUMN "end_date" DROP NOT NULL;

-- AlterTable
ALTER TABLE "noise" DROP COLUMN "assessment_id";

-- AlterTable
ALTER TABLE "response" ADD COLUMN     "assessment_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "response_option" ADD COLUMN     "assessment_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "accessibility";

-- DropTable
DROP TABLE "activities_area";

-- DropTable
DROP TABLE "destruction";

-- DropTable
DROP TABLE "events";

-- DropTable
DROP TABLE "landscaping";

-- DropTable
DROP TABLE "seating";

-- DropTable
DROP TABLE "security";

-- DropTable
DROP TABLE "surrounding_activity";

-- DropTable
DROP TABLE "surrounding_area";

-- DropTable
DROP TABLE "traffic_safety";

-- CreateTable
CREATE TABLE "_AssessmentToQuestion" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AssessmentToQuestion_AB_unique" ON "_AssessmentToQuestion"("A", "B");

-- CreateIndex
CREATE INDEX "_AssessmentToQuestion_B_index" ON "_AssessmentToQuestion"("B");

-- AddForeignKey
ALTER TABLE "response" ADD CONSTRAINT "response_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_option" ADD CONSTRAINT "response_option_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssessmentToQuestion" ADD CONSTRAINT "_AssessmentToQuestion_A_fkey" FOREIGN KEY ("A") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssessmentToQuestion" ADD CONSTRAINT "_AssessmentToQuestion_B_fkey" FOREIGN KEY ("B") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
