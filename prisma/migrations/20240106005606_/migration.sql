-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "week_days" AS ENUM ('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');

-- CreateEnum
CREATE TYPE "brazilian_states" AS ENUM ('Acre', 'Alagoas', 'Amapa', 'Amazonas', 'Bahia', 'Ceara', 'Distrito Federal', 'Espirito Santo', 'Goias', 'Maranhao', 'Matro Grosso', 'Mato Grosso do Sul', 'Minas Gerais', 'Para', 'Paraiba', 'Parana', 'Pernambuco', 'Piaui', 'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondonia', 'Roraima', 'Santa Catarina', 'Sao Paulo', 'Sergipe', 'Tocantins');

-- CreateEnum
CREATE TYPE "location_types" AS ENUM ('Central and Large Flowerbeds', 'Court Edges', 'Garden', 'Square', 'Overlook', 'Park', 'Fenced Park', 'Unoccupied Plot', 'Remnants of Road Construction/Land Division', 'Roundabouts', 'Interchange');

-- CreateEnum
CREATE TYPE "user_types" AS ENUM ('Admin', 'Researcher');

-- CreateEnum
CREATE TYPE "category_types" AS ENUM ('for Social Practices', 'Open Space for non-Collective Use');

-- CreateEnum
CREATE TYPE "question_types" AS ENUM ('Text', 'Numeric', 'Options');

-- CreateEnum
CREATE TYPE "option_types" AS ENUM ('selection', 'radio', 'checkbox');

-- CreateEnum
CREATE TYPE "maintenance" AS ENUM ('terrible', 'poor', 'good', 'great');

-- CreateEnum
CREATE TYPE "interference" AS ENUM ('small', 'medium', 'great');

-- CreateEnum
CREATE TYPE "visibility" AS ENUM ('up to 25%', 'up to 50%', 'up to 75%', 'up to 100%');

-- CreateEnum
CREATE TYPE "age_group" AS ENUM ('child', 'teen', 'adult', 'elderly');

-- CreateEnum
CREATE TYPE "atividade" AS ENUM ('sedentary', 'walking', 'strenuous');

-- CreateEnum
CREATE TYPE "sex" AS ENUM ('male', 'female');

-- CreateTable
CREATE TABLE "category" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "optional" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "optional" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "type" "question_types" NOT NULL,
    "category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "text_question" (
    "id" SERIAL NOT NULL,
    "char_limit" INTEGER,
    "question_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "text_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "numeric_question" (
    "id" SERIAL NOT NULL,
    "min" INTEGER,
    "max" INTEGER,
    "question_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "numeric_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "options_question" (
    "id" SERIAL NOT NULL,
    "option_type" "option_types" NOT NULL,
    "maximum_selections" INTEGER,
    "question_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "options_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "option" (
    "id" SERIAL NOT NULL,
    "text" VARCHAR(255) NOT NULL,
    "options_question_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "is_park" BOOLEAN,
    "notes" TEXT,
    "creation_year" DATE,
    "last_maintenance_year" DATE,
    "overseeing_mayor" VARCHAR(255),
    "legislation" VARCHAR(255),
    "usable_area" DOUBLE PRECISION,
    "legal_area" DOUBLE PRECISION,
    "incline" DOUBLE PRECISION,
    "urban_region" VARCHAR(255),
    "inactive_not_found" BOOLEAN,
    "polygon_area" DOUBLE PRECISION,
    "narrow_region" TEXT,
    "broad_region" TEXT,
    "type" "location_types",
    "category" "category_types",
    "polygon" Geometry(MultiPolygon, 4326),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "address" (
    "id" SERIAL NOT NULL,
    "neighborhood" VARCHAR(255) NOT NULL,
    "street" VARCHAR(255) NOT NULL,
    "postal_code" VARCHAR(255) NOT NULL,
    "identifier" INTEGER NOT NULL,
    "state" "brazilian_states" NOT NULL,
    "location_id" INTEGER NOT NULL,
    "city_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "city" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "city_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "region" (
    "id" SERIAL NOT NULL,
    "region" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" SERIAL NOT NULL,
    "start_date" TIMESTAMPTZ NOT NULL,
    "end_date" TIMESTAMPTZ NOT NULL,
    "changed_delimitation" BOOLEAN,
    "wifi" BOOLEAN NOT NULL,
    "paved_sidewalk" BOOLEAN NOT NULL,
    "trash_can_amount" INTEGER NOT NULL,
    "bathroom_amount" INTEGER NOT NULL,
    "payphone_amount" INTEGER NOT NULL,
    "drinking_fountain_amount" INTEGER NOT NULL,
    "artwork_amount" INTEGER NOT NULL,
    "planned_landscaping_amount" INTEGER NOT NULL,
    "movable_seats_amount" INTEGER NOT NULL,
    "sidewalk_condition" "maintenance" NOT NULL,
    "trash_can_condition" "maintenance" NOT NULL,
    "bathroom_condition" "maintenance" NOT NULL,
    "payphone_condition" "maintenance" NOT NULL,
    "drinking_fountain_condition" "maintenance" NOT NULL,
    "artwork_condition" "maintenance" NOT NULL,
    "planned_landscaping_condition" "maintenance" NOT NULL,
    "movable_seats_condition" "maintenance" NOT NULL,
    "location_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" "user_types" NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accessibility" (
    "id" SERIAL NOT NULL,
    "surrounding_sidewalk_unrestricted_lane" BOOLEAN NOT NULL,
    "surrounding_sidewalk_service_lane" BOOLEAN NOT NULL,
    "ample_height" BOOLEAN NOT NULL,
    "signaled_crosswalk" BOOLEAN NOT NULL,
    "clear_paths" BOOLEAN NOT NULL,
    "maximum_incline" BOOLEAN NOT NULL,
    "longitudinal_incline" BOOLEAN NOT NULL,
    "tactile_signage" BOOLEAN NOT NULL,
    "safety_coated_flooring" BOOLEAN NOT NULL,
    "impaired_parking_amount" INTEGER NOT NULL,
    "elderly_parking_amount" INTEGER NOT NULL,
    "accessible_route" BOOLEAN NOT NULL,
    "accessible_equipment" BOOLEAN NOT NULL,
    "assessment_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accessibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surrounding_area" (
    "id" SERIAL NOT NULL,
    "fenced_with_operating_hours" BOOLEAN NOT NULL,
    "nameplate" BOOLEAN NOT NULL,
    "bus_stands_amount" INTEGER NOT NULL,
    "taxi_parking_amount" INTEGER NOT NULL,
    "car_parking_amount" INTEGER NOT NULL,
    "motorcycle_parking_amount" INTEGER NOT NULL,
    "bike_lane" BOOLEAN NOT NULL,
    "assessment_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "surrounding_area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities_area" (
    "id" SERIAL NOT NULL,
    "category" INTEGER NOT NULL,
    "required_shade" BOOLEAN NOT NULL,
    "lighting" BOOLEAN NOT NULL,
    "fencing" BOOLEAN NOT NULL,
    "benches" BOOLEAN NOT NULL,
    "condition" "maintenance" NOT NULL,
    "report" TEXT,
    "assessment_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destruction" (
    "id" SERIAL NOT NULL,
    "graffiti_interference_level" "interference" NOT NULL,
    "neglect_interference_level" "interference" NOT NULL,
    "assessment_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "destruction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landscaping" (
    "id" SERIAL NOT NULL,
    "category" INTEGER NOT NULL,
    "required_shade" BOOLEAN NOT NULL,
    "lighting" BOOLEAN NOT NULL,
    "fencing" BOOLEAN NOT NULL,
    "benches" BOOLEAN NOT NULL,
    "condition" "maintenance" NOT NULL,
    "report" TEXT,
    "assessment_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landscaping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seating" (
    "id" SERIAL NOT NULL,
    "categoria" INTEGER NOT NULL,
    "required_shade" BOOLEAN NOT NULL,
    "lighting" BOOLEAN NOT NULL,
    "fencing" BOOLEAN NOT NULL,
    "benches" BOOLEAN NOT NULL,
    "condition" "maintenance" NOT NULL,
    "report" TEXT,
    "assessment_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "yearly_incidence" INTEGER NOT NULL,
    "category" INTEGER NOT NULL,
    "maintainer" VARCHAR(255) NOT NULL,
    "assessment_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traffic_safety" (
    "id" SERIAL NOT NULL,
    "crosswalk" BOOLEAN NOT NULL,
    "traffic_light" BOOLEAN NOT NULL,
    "speed_signage" BOOLEAN NOT NULL,
    "assessment_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "traffic_safety_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surrounding_activity" (
    "id" SERIAL NOT NULL,
    "surrounding_establishments" TEXT NOT NULL,
    "assessment_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "surrounding_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security" (
    "id" SERIAL NOT NULL,
    "cameras" BOOLEAN NOT NULL,
    "police_station" BOOLEAN NOT NULL,
    "visibility_level" "visibility" NOT NULL,
    "assessment_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "security_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tally" (
    "id" SERIAL NOT NULL,
    "date" DATE,
    "startDate" TIMESTAMPTZ(0),
    "endDate" TIMESTAMPTZ(0),
    "animals_amount" INTEGER,
    "temperature" DOUBLE PRECISION,
    "weather_condition" VARCHAR(255),
    "location_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tally_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person" (
    "id" SERIAL NOT NULL,
    "age_group" "age_group" NOT NULL,
    "sex" "sex" NOT NULL,
    "activity" "atividade" NOT NULL,
    "is_traversing" BOOLEAN NOT NULL,
    "is_impaired_person" BOOLEAN NOT NULL,
    "is_in_apparent_illicit_activity" BOOLEAN NOT NULL,
    "is_person_without_housing" BOOLEAN NOT NULL,
    "tally_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "noise" (
    "id" SERIAL NOT NULL,
    "category" VARCHAR(255) NOT NULL,
    "sound_level" DOUBLE PRECISION NOT NULL,
    "location_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "noise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CityToRegion" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AssessmentToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "text_question_question_id_key" ON "text_question"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "numeric_question_question_id_key" ON "numeric_question"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "options_question_question_id_key" ON "options_question"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "city_name_key" ON "city"("name");

-- CreateIndex
CREATE UNIQUE INDEX "accessibility_assessment_id_key" ON "accessibility"("assessment_id");

-- CreateIndex
CREATE UNIQUE INDEX "surrounding_area_assessment_id_key" ON "surrounding_area"("assessment_id");

-- CreateIndex
CREATE UNIQUE INDEX "destruction_assessment_id_key" ON "destruction"("assessment_id");

-- CreateIndex
CREATE UNIQUE INDEX "events_assessment_id_key" ON "events"("assessment_id");

-- CreateIndex
CREATE UNIQUE INDEX "traffic_safety_assessment_id_key" ON "traffic_safety"("assessment_id");

-- CreateIndex
CREATE UNIQUE INDEX "surrounding_activity_assessment_id_key" ON "surrounding_activity"("assessment_id");

-- CreateIndex
CREATE UNIQUE INDEX "security_assessment_id_key" ON "security"("assessment_id");

-- CreateIndex
CREATE UNIQUE INDEX "tally_location_id_key" ON "tally"("location_id");

-- CreateIndex
CREATE UNIQUE INDEX "noise_location_id_key" ON "noise"("location_id");

-- CreateIndex
CREATE UNIQUE INDEX "_CityToRegion_AB_unique" ON "_CityToRegion"("A", "B");

-- CreateIndex
CREATE INDEX "_CityToRegion_B_index" ON "_CityToRegion"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AssessmentToUser_AB_unique" ON "_AssessmentToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_AssessmentToUser_B_index" ON "_AssessmentToUser"("B");

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "text_question" ADD CONSTRAINT "text_question_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "numeric_question" ADD CONSTRAINT "numeric_question_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "options_question" ADD CONSTRAINT "options_question_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "option" ADD CONSTRAINT "option_options_question_id_fkey" FOREIGN KEY ("options_question_id") REFERENCES "options_question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accessibility" ADD CONSTRAINT "accessibility_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surrounding_area" ADD CONSTRAINT "surrounding_area_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities_area" ADD CONSTRAINT "activities_area_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destruction" ADD CONSTRAINT "destruction_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landscaping" ADD CONSTRAINT "landscaping_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seating" ADD CONSTRAINT "seating_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traffic_safety" ADD CONSTRAINT "traffic_safety_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surrounding_activity" ADD CONSTRAINT "surrounding_activity_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security" ADD CONSTRAINT "security_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tally" ADD CONSTRAINT "tally_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person" ADD CONSTRAINT "person_tally_id_fkey" FOREIGN KEY ("tally_id") REFERENCES "tally"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "noise" ADD CONSTRAINT "noise_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CityToRegion" ADD CONSTRAINT "_CityToRegion_A_fkey" FOREIGN KEY ("A") REFERENCES "city"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CityToRegion" ADD CONSTRAINT "_CityToRegion_B_fkey" FOREIGN KEY ("B") REFERENCES "region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssessmentToUser" ADD CONSTRAINT "_AssessmentToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssessmentToUser" ADD CONSTRAINT "_AssessmentToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
