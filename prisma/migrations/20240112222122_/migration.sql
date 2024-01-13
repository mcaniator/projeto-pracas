-- AlterTable
ALTER TABLE "Assessment" ALTER COLUMN "start_date" DROP NOT NULL,
ALTER COLUMN "end_date" DROP NOT NULL,
ALTER COLUMN "wifi" DROP NOT NULL,
ALTER COLUMN "paved_sidewalk" DROP NOT NULL,
ALTER COLUMN "trash_can_amount" DROP NOT NULL,
ALTER COLUMN "bathroom_amount" DROP NOT NULL,
ALTER COLUMN "payphone_amount" DROP NOT NULL,
ALTER COLUMN "drinking_fountain_amount" DROP NOT NULL,
ALTER COLUMN "artwork_amount" DROP NOT NULL,
ALTER COLUMN "planned_landscaping_amount" DROP NOT NULL,
ALTER COLUMN "movable_seats_amount" DROP NOT NULL,
ALTER COLUMN "sidewalk_condition" DROP NOT NULL,
ALTER COLUMN "trash_can_condition" DROP NOT NULL,
ALTER COLUMN "bathroom_condition" DROP NOT NULL,
ALTER COLUMN "payphone_condition" DROP NOT NULL,
ALTER COLUMN "drinking_fountain_condition" DROP NOT NULL,
ALTER COLUMN "artwork_condition" DROP NOT NULL,
ALTER COLUMN "planned_landscaping_condition" DROP NOT NULL,
ALTER COLUMN "movable_seats_condition" DROP NOT NULL;
