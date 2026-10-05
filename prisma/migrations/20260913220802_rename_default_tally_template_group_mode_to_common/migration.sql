/*
  Warnings:

  - The values [DEFAULT] on the enum `tally_template_group_display_modes` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "tally_template_group_display_modes_new" AS ENUM ('COMMON', 'COUNTERS', 'SCREEN_CONTEXT_SELECTOR');
ALTER TABLE "tally_template_group" ALTER COLUMN "display_mode" DROP DEFAULT;
ALTER TABLE "tally_template_group" ALTER COLUMN "display_mode" TYPE "tally_template_group_display_modes_new" USING ("display_mode"::text::"tally_template_group_display_modes_new");
ALTER TYPE "tally_template_group_display_modes" RENAME TO "tally_template_group_display_modes_old";
ALTER TYPE "tally_template_group_display_modes_new" RENAME TO "tally_template_group_display_modes";
DROP TYPE "tally_template_group_display_modes_old";
ALTER TABLE "tally_template_group" ALTER COLUMN "display_mode" SET DEFAULT 'COMMON';
COMMIT;

-- AlterTable
ALTER TABLE "tally_template_group" ALTER COLUMN "display_mode" SET DEFAULT 'COMMON';
