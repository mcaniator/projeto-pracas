-- CreateTable
CREATE TABLE "person_characteristic_group" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "icon_key" VARCHAR(255) NOT NULL,
    "allows_multiple" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "person_characteristic_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_characteristic" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "icon_key" VARCHAR(255) NOT NULL,
    "color" VARCHAR(64) NOT NULL,
    "group_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "person_characteristic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modular_tally_template" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "finalized" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modular_tally_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tally_template_group" (
    "id" SERIAL NOT NULL,
    "modular_tally_template_id" INTEGER NOT NULL,
    "person_characteristic_group_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "is_count_axis" BOOLEAN NOT NULL DEFAULT false,
    "is_screen_state_selector" BOOLEAN NOT NULL DEFAULT false,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "default_characteristic_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tally_template_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tally_template_characteristic" (
    "id" SERIAL NOT NULL,
    "tally_template_group_id" INTEGER NOT NULL,
    "person_characteristic_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tally_template_characteristic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modular_tally" (
    "id" SERIAL NOT NULL,
    "start_date" TIMESTAMPTZ(0) NOT NULL,
    "end_date" TIMESTAMPTZ(0),
    "is_finalized" BOOLEAN NOT NULL DEFAULT false,
    "user_id" VARCHAR(255) NOT NULL,
    "location_id" INTEGER NOT NULL,
    "modular_tally_template_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modular_tally_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modular_tally_person_observation" (
    "id" SERIAL NOT NULL,
    "modular_tally_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "modular_tally_person_observation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modular_tally_person_observation_characteristic" (
    "modular_tally_person_observation_id" INTEGER NOT NULL,
    "tally_template_characteristic_id" INTEGER NOT NULL,

    CONSTRAINT "modular_tally_person_observation_characteristic_pkey" PRIMARY KEY ("modular_tally_person_observation_id","tally_template_characteristic_id")
);

-- CreateIndex
CREATE INDEX "person_characteristic_group_id_idx" ON "person_characteristic"("group_id");

-- CreateIndex
CREATE UNIQUE INDEX "tally_template_group_default_characteristic_id_key" ON "tally_template_group"("default_characteristic_id");

-- CreateIndex
CREATE INDEX "tally_template_group_person_characteristic_group_id_idx" ON "tally_template_group"("person_characteristic_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "tally_template_group_modular_tally_template_id_person_chara_key" ON "tally_template_group"("modular_tally_template_id", "person_characteristic_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "tally_template_group_modular_tally_template_id_position_key" ON "tally_template_group"("modular_tally_template_id", "position");

-- CreateIndex
CREATE INDEX "tally_template_characteristic_person_characteristic_id_idx" ON "tally_template_characteristic"("person_characteristic_id");

-- CreateIndex
CREATE UNIQUE INDEX "tally_template_characteristic_tally_template_group_id_perso_key" ON "tally_template_characteristic"("tally_template_group_id", "person_characteristic_id");

-- CreateIndex
CREATE UNIQUE INDEX "tally_template_characteristic_tally_template_group_id_posit_key" ON "tally_template_characteristic"("tally_template_group_id", "position");

-- CreateIndex
CREATE INDEX "modular_tally_user_id_idx" ON "modular_tally"("user_id");

-- CreateIndex
CREATE INDEX "modular_tally_location_id_idx" ON "modular_tally"("location_id");

-- CreateIndex
CREATE INDEX "modular_tally_modular_tally_template_id_idx" ON "modular_tally"("modular_tally_template_id");

-- CreateIndex
CREATE INDEX "modular_tally_person_observation_modular_tally_id_idx" ON "modular_tally_person_observation"("modular_tally_id");

-- CreateIndex
CREATE INDEX "modular_tally_person_observation_characteristic_tally_templ_idx" ON "modular_tally_person_observation_characteristic"("tally_template_characteristic_id");

-- AddForeignKey
ALTER TABLE "person_characteristic" ADD CONSTRAINT "person_characteristic_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "person_characteristic_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tally_template_group" ADD CONSTRAINT "tally_template_group_modular_tally_template_id_fkey" FOREIGN KEY ("modular_tally_template_id") REFERENCES "modular_tally_template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tally_template_group" ADD CONSTRAINT "tally_template_group_person_characteristic_group_id_fkey" FOREIGN KEY ("person_characteristic_group_id") REFERENCES "person_characteristic_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tally_template_group" ADD CONSTRAINT "tally_template_group_default_characteristic_id_fkey" FOREIGN KEY ("default_characteristic_id") REFERENCES "tally_template_characteristic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tally_template_characteristic" ADD CONSTRAINT "tally_template_characteristic_tally_template_group_id_fkey" FOREIGN KEY ("tally_template_group_id") REFERENCES "tally_template_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tally_template_characteristic" ADD CONSTRAINT "tally_template_characteristic_person_characteristic_id_fkey" FOREIGN KEY ("person_characteristic_id") REFERENCES "person_characteristic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modular_tally" ADD CONSTRAINT "modular_tally_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modular_tally" ADD CONSTRAINT "modular_tally_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modular_tally" ADD CONSTRAINT "modular_tally_modular_tally_template_id_fkey" FOREIGN KEY ("modular_tally_template_id") REFERENCES "modular_tally_template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modular_tally_person_observation" ADD CONSTRAINT "modular_tally_person_observation_modular_tally_id_fkey" FOREIGN KEY ("modular_tally_id") REFERENCES "modular_tally"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modular_tally_person_observation_characteristic" ADD CONSTRAINT "modular_tally_person_observation_characteristic_modular_ta_fkey" FOREIGN KEY ("modular_tally_person_observation_id") REFERENCES "modular_tally_person_observation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modular_tally_person_observation_characteristic" ADD CONSTRAINT "modular_tally_person_observation_characteristic_tally_temp_fkey" FOREIGN KEY ("tally_template_characteristic_id") REFERENCES "tally_template_characteristic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
