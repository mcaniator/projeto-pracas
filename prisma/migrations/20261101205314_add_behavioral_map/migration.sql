-- CreateTable
CREATE TABLE "behavioral_map_protocol" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "finalized" BOOLEAN NOT NULL DEFAULT false,
    "form_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "behavioral_map_protocol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "behavioral_map_protocol_group" (
    "id" SERIAL NOT NULL,
    "behavioral_map_protocol_id" INTEGER NOT NULL,
    "person_characteristic_group_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "behavioral_map_protocol_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "behavioral_map_protocol_characteristic" (
    "id" SERIAL NOT NULL,
    "behavioral_map_protocol_group_id" INTEGER NOT NULL,
    "person_characteristic_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "behavioral_map_protocol_characteristic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "behavioral_map" (
    "id" SERIAL NOT NULL,
    "start_date" TIMESTAMPTZ(0) NOT NULL,
    "end_date" TIMESTAMPTZ(0),
    "is_finalized" BOOLEAN NOT NULL DEFAULT false,
    "user_id" VARCHAR(255) NOT NULL,
    "location_id" INTEGER NOT NULL,
    "behavioral_map_protocol_id" INTEGER NOT NULL,
    "form_submission_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "behavioral_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "behavioral_map_group" (
    "id" SERIAL NOT NULL,
    "behavioral_map_id" INTEGER NOT NULL,
    "label" VARCHAR(255),

    CONSTRAINT "behavioral_map_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "behavioral_map_person_observation" (
    "id" SERIAL NOT NULL,
    "behavioral_map_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "position" Geometry(Point, 4326),
    "observed_at" TIMESTAMPTZ(0) NOT NULL,
    "behavioral_map_group_id" INTEGER,

    CONSTRAINT "behavioral_map_person_observation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "behavioral_map_person_observation_characteristic" (
    "behavioral_map_person_observation_id" INTEGER NOT NULL,
    "person_characteristic_id" INTEGER NOT NULL,

    CONSTRAINT "behavioral_map_person_observation_characteristic_pkey" PRIMARY KEY ("behavioral_map_person_observation_id","person_characteristic_id")
);

-- CreateTable
CREATE TABLE "behavioral_map_person_observation_response_geometry" (
    "behavioral_map_id" INTEGER NOT NULL,
    "person_observation_id" INTEGER NOT NULL,
    "response_geometry_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "behavioral_map_person_observation_response_geometry_pkey" PRIMARY KEY ("behavioral_map_id","person_observation_id","response_geometry_id")
);

-- CreateTable
CREATE TABLE "behavioral_map_person_observation_interaction" (
    "id" SERIAL NOT NULL,
    "behavioral_map_id" INTEGER NOT NULL,
    "observation_a_id" INTEGER NOT NULL,
    "observation_b_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "behavioral_map_person_observation_interaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "behavioral_map_protocol_group_person_characteristic_group_i_idx" ON "behavioral_map_protocol_group"("person_characteristic_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "behavioral_map_protocol_group_behavioral_map_protocol_id_pe_key" ON "behavioral_map_protocol_group"("behavioral_map_protocol_id", "person_characteristic_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "behavioral_map_protocol_group_behavioral_map_protocol_id_po_key" ON "behavioral_map_protocol_group"("behavioral_map_protocol_id", "position");

-- CreateIndex
CREATE INDEX "behavioral_map_protocol_characteristic_person_characteristi_idx" ON "behavioral_map_protocol_characteristic"("person_characteristic_id");

-- CreateIndex
CREATE UNIQUE INDEX "behavioral_map_protocol_char_group_char_key" ON "behavioral_map_protocol_characteristic"("behavioral_map_protocol_group_id", "person_characteristic_id");

-- CreateIndex
CREATE UNIQUE INDEX "behavioral_map_protocol_char_group_position_key" ON "behavioral_map_protocol_characteristic"("behavioral_map_protocol_group_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "behavioral_map_form_submission_id_key" ON "behavioral_map"("form_submission_id");

-- CreateIndex
CREATE INDEX "behavioral_map_user_id_idx" ON "behavioral_map"("user_id");

-- CreateIndex
CREATE INDEX "behavioral_map_location_id_idx" ON "behavioral_map"("location_id");

-- CreateIndex
CREATE INDEX "behavioral_map_behavioral_map_protocol_id_idx" ON "behavioral_map"("behavioral_map_protocol_id");

-- CreateIndex
CREATE INDEX "behavioral_map_group_behavioral_map_id_idx" ON "behavioral_map_group"("behavioral_map_id");

-- CreateIndex
CREATE INDEX "behavioral_map_person_observation_behavioral_map_id_idx" ON "behavioral_map_person_observation"("behavioral_map_id");

-- CreateIndex
CREATE INDEX "behavioral_map_person_observation_behavioral_map_group_id_idx" ON "behavioral_map_person_observation"("behavioral_map_group_id");

-- CreateIndex
CREATE INDEX "behavioral_map_person_observation_characteristic_person_cha_idx" ON "behavioral_map_person_observation_characteristic"("person_characteristic_id");

-- CreateIndex
CREATE INDEX "behavioral_map_person_observation_response_geometry_respons_idx" ON "behavioral_map_person_observation_response_geometry"("response_geometry_id");

-- CreateIndex
CREATE INDEX "behavioral_map_person_observation_interaction_behavioral_ma_idx" ON "behavioral_map_person_observation_interaction"("behavioral_map_id");

-- CreateIndex
CREATE INDEX "behavioral_map_person_observation_interaction_observation_a_idx" ON "behavioral_map_person_observation_interaction"("observation_a_id");

-- CreateIndex
CREATE INDEX "behavioral_map_person_observation_interaction_observation_b_idx" ON "behavioral_map_person_observation_interaction"("observation_b_id");

-- AddForeignKey
ALTER TABLE "behavioral_map_protocol" ADD CONSTRAINT "behavioral_map_protocol_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "form"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavioral_map_protocol_group" ADD CONSTRAINT "behavioral_map_protocol_group_behavioral_map_protocol_id_fkey" FOREIGN KEY ("behavioral_map_protocol_id") REFERENCES "behavioral_map_protocol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavioral_map_protocol_group" ADD CONSTRAINT "behavioral_map_protocol_group_person_characteristic_group__fkey" FOREIGN KEY ("person_characteristic_group_id") REFERENCES "person_characteristic_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavioral_map_protocol_characteristic" ADD CONSTRAINT "behavioral_map_protocol_characteristic_behavioral_map_prot_fkey" FOREIGN KEY ("behavioral_map_protocol_group_id") REFERENCES "behavioral_map_protocol_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavioral_map_protocol_characteristic" ADD CONSTRAINT "behavioral_map_protocol_characteristic_person_characterist_fkey" FOREIGN KEY ("person_characteristic_id") REFERENCES "person_characteristic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavioral_map" ADD CONSTRAINT "behavioral_map_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavioral_map" ADD CONSTRAINT "behavioral_map_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavioral_map" ADD CONSTRAINT "behavioral_map_behavioral_map_protocol_id_fkey" FOREIGN KEY ("behavioral_map_protocol_id") REFERENCES "behavioral_map_protocol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavioral_map" ADD CONSTRAINT "behavioral_map_form_submission_id_fkey" FOREIGN KEY ("form_submission_id") REFERENCES "form_submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavioral_map_group" ADD CONSTRAINT "behavioral_map_group_behavioral_map_id_fkey" FOREIGN KEY ("behavioral_map_id") REFERENCES "behavioral_map"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavioral_map_person_observation" ADD CONSTRAINT "behavioral_map_person_observation_behavioral_map_id_fkey" FOREIGN KEY ("behavioral_map_id") REFERENCES "behavioral_map"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavioral_map_person_observation" ADD CONSTRAINT "behavioral_map_person_observation_behavioral_map_group_id_fkey" FOREIGN KEY ("behavioral_map_group_id") REFERENCES "behavioral_map_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavioral_map_person_observation_characteristic" ADD CONSTRAINT "behavioral_map_person_observation_characteristic_behaviora_fkey" FOREIGN KEY ("behavioral_map_person_observation_id") REFERENCES "behavioral_map_person_observation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavioral_map_person_observation_characteristic" ADD CONSTRAINT "behavioral_map_person_observation_characteristic_person_ch_fkey" FOREIGN KEY ("person_characteristic_id") REFERENCES "person_characteristic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavioral_map_person_observation_response_geometry" ADD CONSTRAINT "behavioral_map_person_observation_response_geometry_behavi_fkey" FOREIGN KEY ("behavioral_map_id") REFERENCES "behavioral_map"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavioral_map_person_observation_response_geometry" ADD CONSTRAINT "behavioral_map_person_observation_response_geometry_person_fkey" FOREIGN KEY ("person_observation_id") REFERENCES "behavioral_map_person_observation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavioral_map_person_observation_response_geometry" ADD CONSTRAINT "behavioral_map_person_observation_response_geometry_respon_fkey" FOREIGN KEY ("response_geometry_id") REFERENCES "response_geometry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavioral_map_person_observation_interaction" ADD CONSTRAINT "behavioral_map_person_observation_interaction_behavioral_m_fkey" FOREIGN KEY ("behavioral_map_id") REFERENCES "behavioral_map"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavioral_map_person_observation_interaction" ADD CONSTRAINT "behavioral_map_obs_interaction_obs_a_fkey" FOREIGN KEY ("observation_a_id") REFERENCES "behavioral_map_person_observation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavioral_map_person_observation_interaction" ADD CONSTRAINT "behavioral_map_obs_interaction_obs_b_fkey" FOREIGN KEY ("observation_b_id") REFERENCES "behavioral_map_person_observation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
