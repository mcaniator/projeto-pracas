-- DropIndex
DROP INDEX "tally_template_group_modular_tally_template_id_position_key";

-- AlterTable
ALTER TABLE "tally_template_group" ALTER COLUMN "position" DROP NOT NULL;
