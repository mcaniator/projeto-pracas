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
CREATE TYPE "gender" AS ENUM ('male', 'female', 'non-binary');

-- CreateEnum
CREATE TYPE "noise_categories" AS ENUM ('center', 'surroundings');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255),
    "username" VARCHAR(255) NOT NULL,
    "type" "user_types" NOT NULL,
    "hashed_password" TEXT NOT NULL,
    "assessment_id" INTEGER,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

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
    "char_limit" INTEGER,
    "minValue" INTEGER,
    "maxValue" INTEGER,
    "option_type" "option_types",
    "maximum_selections" INTEGER,
    "category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "response" (
    "id" SERIAL NOT NULL,
    "type" "question_types" NOT NULL,
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "location_id" INTEGER NOT NULL,
    "form_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "response" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "response_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "option" (
    "id" SERIAL NOT NULL,
    "text" VARCHAR(255) NOT NULL,
    "question_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "responseOption" (
    "id" SERIAL NOT NULL,
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "location_id" INTEGER NOT NULL,
    "form_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "option_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "responseOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form" (
    "id" SERIAL NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions_on_forms" (
    "id" SERIAL NOT NULL,
    "form_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,

    CONSTRAINT "questions_on_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "firstStreet" VARCHAR(255) NOT NULL,
    "secondStreet" VARCHAR(255) NOT NULL,
    "is_park" BOOLEAN,
    "notes" TEXT,
    "creation_year" DATE,
    "last_maintenance_year" DATE,
    "overseeing_mayor" VARCHAR(255),
    "legislation" VARCHAR(255),
    "usable_area" DOUBLE PRECISION,
    "legal_area" DOUBLE PRECISION,
    "incline" DOUBLE PRECISION,
    "inactive_not_found" BOOLEAN,
    "polygon_area" DOUBLE PRECISION,
    "type" "location_types",
    "category" "category_types",
    "polygon" Geometry(MultiPolygon, 4326),
    "narrowAdministrativeUnitId" INTEGER,
    "intermediateAdministrativeUnitId" INTEGER,
    "broadAdministrativeUnitId" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "narrow_administrative_unit" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "city_id" INTEGER NOT NULL,

    CONSTRAINT "narrow_administrative_unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intermediate_administrative_unit" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "city_id" INTEGER NOT NULL,

    CONSTRAINT "intermediate_administrative_unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broad_administrative_unit" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "city_id" INTEGER NOT NULL,

    CONSTRAINT "broad_administrative_unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" SERIAL NOT NULL,
    "start_date" TIMESTAMPTZ NOT NULL,
    "end_date" TIMESTAMPTZ NOT NULL,
    "changed_delimitation" BOOLEAN,
    "has_wifi" BOOLEAN NOT NULL,
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
CREATE TABLE "tally_person" (
    "id" SERIAL NOT NULL,
    "tally_id" INTEGER NOT NULL,
    "person_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "tally_person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person" (
    "id" SERIAL NOT NULL,
    "age_group" "age_group" NOT NULL,
    "gender" "gender" NOT NULL,
    "activity" "atividade" NOT NULL,
    "is_traversing" BOOLEAN NOT NULL,
    "is_person_with_impairment" BOOLEAN NOT NULL,
    "is_in_apparent_illicit_activity" BOOLEAN NOT NULL,
    "is_person_without_housing" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "noise" (
    "id" SERIAL NOT NULL,
    "location" "noise_categories" NOT NULL,
    "sound_level" DOUBLE PRECISION NOT NULL,
    "point" Geometry(Point, 4326),
    "assessment_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "noise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_id_key" ON "user"("id");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE INDEX "user_username_idx" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Session_id_key" ON "Session"("id");

-- CreateIndex
CREATE INDEX "Session_user_id_idx" ON "Session"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "city_name_key" ON "city"("name");

-- CreateIndex
CREATE UNIQUE INDEX "narrow_administrative_unit_city_id_name_key" ON "narrow_administrative_unit"("city_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "intermediate_administrative_unit_city_id_name_key" ON "intermediate_administrative_unit"("city_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "broad_administrative_unit_city_id_name_key" ON "broad_administrative_unit"("city_id", "name");

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
CREATE UNIQUE INDEX "tally_person_tally_id_person_id_key" ON "tally_person"("tally_id", "person_id");

-- CreateIndex
CREATE UNIQUE INDEX "person_age_group_gender_activity_is_traversing_is_person_wi_key" ON "person"("age_group", "gender", "activity", "is_traversing", "is_person_with_impairment", "is_in_apparent_illicit_activity", "is_person_without_housing");

-- CreateIndex
CREATE INDEX "location_idx" ON "noise" USING GIST ("point");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "Assessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response" ADD CONSTRAINT "response_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response" ADD CONSTRAINT "response_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response" ADD CONSTRAINT "response_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "option" ADD CONSTRAINT "option_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responseOption" ADD CONSTRAINT "responseOption_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responseOption" ADD CONSTRAINT "responseOption_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responseOption" ADD CONSTRAINT "responseOption_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responseOption" ADD CONSTRAINT "responseOption_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "option"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions_on_forms" ADD CONSTRAINT "questions_on_forms_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions_on_forms" ADD CONSTRAINT "questions_on_forms_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location" ADD CONSTRAINT "location_narrowAdministrativeUnitId_fkey" FOREIGN KEY ("narrowAdministrativeUnitId") REFERENCES "narrow_administrative_unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location" ADD CONSTRAINT "location_intermediateAdministrativeUnitId_fkey" FOREIGN KEY ("intermediateAdministrativeUnitId") REFERENCES "intermediate_administrative_unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location" ADD CONSTRAINT "location_broadAdministrativeUnitId_fkey" FOREIGN KEY ("broadAdministrativeUnitId") REFERENCES "broad_administrative_unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "narrow_administrative_unit" ADD CONSTRAINT "narrow_administrative_unit_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intermediate_administrative_unit" ADD CONSTRAINT "intermediate_administrative_unit_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broad_administrative_unit" ADD CONSTRAINT "broad_administrative_unit_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "tally_person" ADD CONSTRAINT "tally_person_tally_id_fkey" FOREIGN KEY ("tally_id") REFERENCES "tally"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tally_person" ADD CONSTRAINT "tally_person_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "noise" ADD CONSTRAINT "noise_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
