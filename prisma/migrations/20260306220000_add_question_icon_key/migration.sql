ALTER TABLE "question"
ADD COLUMN "icon_key" VARCHAR(255);

UPDATE "question"
SET "icon_key" = 'tabler:IconHelp'
WHERE "icon_key" IS NULL;

ALTER TABLE "question"
ALTER COLUMN "icon_key" SET NOT NULL;
