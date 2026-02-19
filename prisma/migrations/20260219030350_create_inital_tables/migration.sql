-- CreateEnum
CREATE TYPE "brazilian_states" AS ENUM ('AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO');

-- CreateEnum
CREATE TYPE "question_types" AS ENUM ('WRITTEN', 'OPTIONS');

-- CreateEnum
CREATE TYPE "QuestionResponseCharacterTypes" AS ENUM ('TEXT', 'NUMBER');

-- CreateEnum
CREATE TYPE "QuestionGeometryTypes" AS ENUM ('POINT', 'POLYGON');

-- CreateEnum
CREATE TYPE "option_types" AS ENUM ('RADIO', 'CHECKBOX');

-- CreateEnum
CREATE TYPE "weather_conditions" AS ENUM ('CLOUDY', 'SUNNY');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PARK_VIEWER', 'PARK_MANAGER', 'FORM_VIEWER', 'FORM_MANAGER', 'ASSESSMENT_VIEWER', 'ASSESSMENT_EDITOR', 'ASSESSMENT_MANAGER', 'TALLY_VIEWER', 'TALLY_EDITOR', 'TALLY_MANAGER', 'USER_VIEWER', 'USER_MANAGER');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "username" VARCHAR(255),
    "roles" "Role"[],
    "password" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "invite" (
    "id" SERIAL NOT NULL,
    "token" VARCHAR(64) NOT NULL,
    "email" TEXT NOT NULL,
    "roles" "Role"[],
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "password_reset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "optional" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
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
    "notes" TEXT,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "subcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "notes" TEXT,
    "question_type" "question_types" NOT NULL,
    "character_type" "QuestionResponseCharacterTypes" NOT NULL,
    "option_type" "option_types",
    "geometry_types" "QuestionGeometryTypes"[],
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
    "expression" TEXT NOT NULL,
    "form_id" INTEGER NOT NULL,
    "target_question_id" INTEGER NOT NULL,

    CONSTRAINT "calculation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "response" (
    "id" SERIAL NOT NULL,
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
    "name" VARCHAR(255) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "finalized" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_item" (
    "id" SERIAL NOT NULL,
    "form_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "subcategory_id" INTEGER,
    "question_id" INTEGER,

    CONSTRAINT "form_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "popular_name" VARCHAR(255),
    "first_street" VARCHAR(255) NOT NULL,
    "second_street" VARCHAR(255),
    "third_street" VARCHAR(255),
    "fourth_street" VARCHAR(255),
    "notes" TEXT,
    "city_id" INTEGER NOT NULL,
    "creation_year" INTEGER,
    "last_maintenance_year" INTEGER,
    "legislation" VARCHAR(255),
    "usable_area" DOUBLE PRECISION,
    "legal_area" DOUBLE PRECISION,
    "incline" DOUBLE PRECISION,
    "is_park" BOOLEAN NOT NULL,
    "inactive_not_found" BOOLEAN NOT NULL,
    "polygon_area" DOUBLE PRECISION,
    "type_id" INTEGER,
    "category_id" INTEGER,
    "polygon" Geometry(MultiPolygon, 4326),
    "main_image_id" INTEGER,
    "narrow_administrative_unit_id" INTEGER,
    "intermediate_administrative_unit_id" INTEGER,
    "broad_administrative_unit_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_type" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "location_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_category" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "location_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "city" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "state" "brazilian_states" NOT NULL,
    "narrow_administrative_unit_title" TEXT,
    "intermediate_administrative_unit_title" TEXT,
    "broad_administrative_unit_title" TEXT,
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
    "tally_person" JSONB[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "tally_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image" (
    "image_id" SERIAL NOT NULL,
    "file_uid" TEXT NOT NULL,
    "relative_path" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "image_pkey" PRIMARY KEY ("image_id")
);

-- CreateTable
CREATE TABLE "_AssessmentToQuestion" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AssessmentToQuestion_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE INDEX "user_username_idx" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "invite_token_key" ON "invite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "invite_email_key" ON "invite"("email");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_user_id_key" ON "password_reset"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_token_key" ON "password_reset"("token");

-- CreateIndex
CREATE UNIQUE INDEX "category_name_key" ON "category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "subcategory_category_id_name_key" ON "subcategory"("category_id", "name");

-- CreateIndex
CREATE INDEX "question_name_idx" ON "question"("name");

-- CreateIndex
CREATE UNIQUE INDEX "question_name_category_id_subcategory_id_key" ON "question"("name", "category_id", "subcategory_id");

-- CreateIndex
CREATE UNIQUE INDEX "question_geometry_assessment_id_question_id_key" ON "question_geometry"("assessment_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "calculation_target_question_id_form_id_key" ON "calculation"("target_question_id", "form_id");

-- CreateIndex
CREATE UNIQUE INDEX "response_assessment_id_question_id_key" ON "response"("assessment_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "form_item_form_id_category_id_subcategory_id_question_id_key" ON "form_item"("form_id", "category_id", "subcategory_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "location_main_image_id_key" ON "location"("main_image_id");

-- CreateIndex
CREATE INDEX "location_city_id_idx" ON "location"("city_id");

-- CreateIndex
CREATE UNIQUE INDEX "location_type_name_key" ON "location_type"("name");

-- CreateIndex
CREATE UNIQUE INDEX "location_category_name_key" ON "location_category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "city_name_state_key" ON "city"("name", "state");

-- CreateIndex
CREATE UNIQUE INDEX "narrow_administrative_unit_city_id_name_key" ON "narrow_administrative_unit"("city_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "intermediate_administrative_unit_city_id_name_key" ON "intermediate_administrative_unit"("city_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "broad_administrative_unit_city_id_name_key" ON "broad_administrative_unit"("city_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "image_file_uid_key" ON "image"("file_uid");

-- CreateIndex
CREATE INDEX "_AssessmentToQuestion_B_index" ON "_AssessmentToQuestion"("B");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset" ADD CONSTRAINT "password_reset_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subcategory" ADD CONSTRAINT "subcategory_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "subcategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_geometry" ADD CONSTRAINT "question_geometry_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_geometry" ADD CONSTRAINT "question_geometry_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculation" ADD CONSTRAINT "calculation_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculation" ADD CONSTRAINT "calculation_target_question_id_fkey" FOREIGN KEY ("target_question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response" ADD CONSTRAINT "response_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response" ADD CONSTRAINT "response_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response" ADD CONSTRAINT "response_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "option" ADD CONSTRAINT "option_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_option" ADD CONSTRAINT "response_option_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_option" ADD CONSTRAINT "response_option_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_option" ADD CONSTRAINT "response_option_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_option" ADD CONSTRAINT "response_option_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "option"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_item" ADD CONSTRAINT "form_item_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_item" ADD CONSTRAINT "form_item_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "subcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_item" ADD CONSTRAINT "form_item_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_item" ADD CONSTRAINT "form_item_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location" ADD CONSTRAINT "location_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location" ADD CONSTRAINT "location_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "location_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location" ADD CONSTRAINT "location_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "location_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location" ADD CONSTRAINT "location_main_image_id_fkey" FOREIGN KEY ("main_image_id") REFERENCES "image"("image_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location" ADD CONSTRAINT "location_narrow_administrative_unit_id_fkey" FOREIGN KEY ("narrow_administrative_unit_id") REFERENCES "narrow_administrative_unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location" ADD CONSTRAINT "location_intermediate_administrative_unit_id_fkey" FOREIGN KEY ("intermediate_administrative_unit_id") REFERENCES "intermediate_administrative_unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location" ADD CONSTRAINT "location_broad_administrative_unit_id_fkey" FOREIGN KEY ("broad_administrative_unit_id") REFERENCES "broad_administrative_unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "_AssessmentToQuestion" ADD CONSTRAINT "_AssessmentToQuestion_A_fkey" FOREIGN KEY ("A") REFERENCES "assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssessmentToQuestion" ADD CONSTRAINT "_AssessmentToQuestion_B_fkey" FOREIGN KEY ("B") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
