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
CREATE TYPE "calculation_types" AS ENUM ('Sum', 'Average', 'Percentage');

-- CreateEnum
CREATE TYPE "category_types" AS ENUM ('for Social Practices', 'Open Space for non-Collective Use');

-- CreateEnum
CREATE TYPE "question_types" AS ENUM ('Written', 'Options');

-- CreateEnum
CREATE TYPE "QuestionResponseCharacterTypes" AS ENUM ('Text', 'Number');

-- CreateEnum
CREATE TYPE "QuestionGeometryTypes" AS ENUM ('Point', 'Polygon');

-- CreateEnum
CREATE TYPE "option_types" AS ENUM ('radio', 'checkbox');

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
CREATE TYPE "gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "noise_categories" AS ENUM ('center', 'surroundings');

-- CreateEnum
CREATE TYPE "weather_conditions" AS ENUM ('cloudy', 'sunny');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255),
    "username" VARCHAR(255) NOT NULL,
    "type" "user_types" NOT NULL,
    "hashed_password" TEXT NOT NULL,

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
CREATE TABLE "subcategory" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "optional" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "subcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "optional" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "type" "question_types" NOT NULL,
    "character_type" "QuestionResponseCharacterTypes" NOT NULL,
    "char_limit" INTEGER,
    "minValue" INTEGER,
    "maxValue" INTEGER,
    "option_type" "option_types",
    "maximum_selections" INTEGER,
    "geometryTypes" "QuestionGeometryTypes"[],
    "category_id" INTEGER NOT NULL,
    "subcategory_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_geometry" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "assessment_id" INTEGER NOT NULL,
    "geometry" Geometry,

    CONSTRAINT "question_geometry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calculation" (
    "id" SERIAL NOT NULL,
    "type" "calculation_types" NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category_id" INTEGER NOT NULL,
    "subcategory_id" INTEGER,

    CONSTRAINT "calculation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "response" (
    "id" SERIAL NOT NULL,
    "type" "question_types" NOT NULL,
    "user_id" TEXT NOT NULL,
    "assessment_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "response" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

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
CREATE TABLE "response_option" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "assessment_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "option_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "response_option_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "location" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "popularName" VARCHAR(255),
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
CREATE TABLE "assessment" (
    "id" SERIAL NOT NULL,
    "start_date" TIMESTAMPTZ NOT NULL,
    "end_date" TIMESTAMPTZ,
    "userId" VARCHAR(255) NOT NULL,
    "location_id" INTEGER NOT NULL,
    "form_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "noise" (
    "id" SERIAL NOT NULL,
    "location" "noise_categories" NOT NULL,
    "sound_level" DOUBLE PRECISION NOT NULL,
    "point" Geometry(Point, 4326),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "noise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tally" (
    "id" SERIAL NOT NULL,
    "start_date" TIMESTAMPTZ(0) NOT NULL,
    "end_date" TIMESTAMPTZ(0),
    "animals_amount" INTEGER,
    "temperature" DOUBLE PRECISION,
    "weather_condition" "weather_conditions",
    "groups" INTEGER,
    "commercial_activities" JSONB,
    "user_id" VARCHAR(255) NOT NULL,
    "location_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

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
CREATE TABLE "_CalculationToQuestion" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_CalculationToForm" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_FormToQuestion" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AssessmentToQuestion" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
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
CREATE UNIQUE INDEX "question_geometry_assessment_id_question_id_key" ON "question_geometry"("assessment_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "response_assessment_id_question_id_key" ON "response"("assessment_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "city_name_key" ON "city"("name");

-- CreateIndex
CREATE UNIQUE INDEX "narrow_administrative_unit_city_id_name_key" ON "narrow_administrative_unit"("city_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "intermediate_administrative_unit_city_id_name_key" ON "intermediate_administrative_unit"("city_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "broad_administrative_unit_city_id_name_key" ON "broad_administrative_unit"("city_id", "name");

-- CreateIndex
CREATE INDEX "location_idx" ON "noise" USING GIST ("point");

-- CreateIndex
CREATE UNIQUE INDEX "tally_person_tally_id_person_id_key" ON "tally_person"("tally_id", "person_id");

-- CreateIndex
CREATE UNIQUE INDEX "person_age_group_gender_activity_is_traversing_is_person_wi_key" ON "person"("age_group", "gender", "activity", "is_traversing", "is_person_with_impairment", "is_in_apparent_illicit_activity", "is_person_without_housing");

-- CreateIndex
CREATE UNIQUE INDEX "_CalculationToQuestion_AB_unique" ON "_CalculationToQuestion"("A", "B");

-- CreateIndex
CREATE INDEX "_CalculationToQuestion_B_index" ON "_CalculationToQuestion"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CalculationToForm_AB_unique" ON "_CalculationToForm"("A", "B");

-- CreateIndex
CREATE INDEX "_CalculationToForm_B_index" ON "_CalculationToForm"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FormToQuestion_AB_unique" ON "_FormToQuestion"("A", "B");

-- CreateIndex
CREATE INDEX "_FormToQuestion_B_index" ON "_FormToQuestion"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AssessmentToQuestion_AB_unique" ON "_AssessmentToQuestion"("A", "B");

-- CreateIndex
CREATE INDEX "_AssessmentToQuestion_B_index" ON "_AssessmentToQuestion"("B");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subcategory" ADD CONSTRAINT "subcategory_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "subcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_geometry" ADD CONSTRAINT "question_geometry_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_geometry" ADD CONSTRAINT "question_geometry_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculation" ADD CONSTRAINT "calculation_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculation" ADD CONSTRAINT "calculation_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "subcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response" ADD CONSTRAINT "response_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response" ADD CONSTRAINT "response_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response" ADD CONSTRAINT "response_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "option" ADD CONSTRAINT "option_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_option" ADD CONSTRAINT "response_option_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_option" ADD CONSTRAINT "response_option_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_option" ADD CONSTRAINT "response_option_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_option" ADD CONSTRAINT "response_option_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "option"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "assessment" ADD CONSTRAINT "assessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment" ADD CONSTRAINT "assessment_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment" ADD CONSTRAINT "assessment_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tally" ADD CONSTRAINT "tally_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tally" ADD CONSTRAINT "tally_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tally_person" ADD CONSTRAINT "tally_person_tally_id_fkey" FOREIGN KEY ("tally_id") REFERENCES "tally"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tally_person" ADD CONSTRAINT "tally_person_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CalculationToQuestion" ADD CONSTRAINT "_CalculationToQuestion_A_fkey" FOREIGN KEY ("A") REFERENCES "calculation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CalculationToQuestion" ADD CONSTRAINT "_CalculationToQuestion_B_fkey" FOREIGN KEY ("B") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CalculationToForm" ADD CONSTRAINT "_CalculationToForm_A_fkey" FOREIGN KEY ("A") REFERENCES "calculation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CalculationToForm" ADD CONSTRAINT "_CalculationToForm_B_fkey" FOREIGN KEY ("B") REFERENCES "form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FormToQuestion" ADD CONSTRAINT "_FormToQuestion_A_fkey" FOREIGN KEY ("A") REFERENCES "form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FormToQuestion" ADD CONSTRAINT "_FormToQuestion_B_fkey" FOREIGN KEY ("B") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssessmentToQuestion" ADD CONSTRAINT "_AssessmentToQuestion_A_fkey" FOREIGN KEY ("A") REFERENCES "assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssessmentToQuestion" ADD CONSTRAINT "_AssessmentToQuestion_B_fkey" FOREIGN KEY ("B") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
