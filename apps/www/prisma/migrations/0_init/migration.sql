-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis" WITH VERSION "3.4.0";

-- CreateTable
CREATE TABLE "SequelizeMeta" (
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" SERIAL NOT NULL,
    "UF" VARCHAR(255),
    "locals_id" INTEGER NOT NULL,
    "city" VARCHAR(255),
    "neighborhood" VARCHAR(255),
    "street" VARCHAR(255),
    "number" VARCHAR(255),
    "planning_region_id" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "optional" BOOLEAN NOT NULL,
    "active" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coutings" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "init_date_time" TIMESTAMPTZ(6),
    "end_date_time" TIMESTAMPTZ(6),
    "count_animals" INTEGER,
    "temperature" INTEGER,
    "sky" VARCHAR(255),
    "person_on_local_id" INTEGER,
    "local_id" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "coutings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "type" INTEGER,
    "email" VARCHAR(255),
    "password" VARCHAR(255),
    "user_id" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "answers" JSON,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "forms_id" INTEGER NOT NULL,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form-structure" (
    "id" SERIAL NOT NULL,
    "id_forms_fields" INTEGER NOT NULL,
    "id_forms" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "form-structure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forms" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forms-fields" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "optional" BOOLEAN NOT NULL,
    "active" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "forms-fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locals" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "polygon" geometry,
    "common_name" VARCHAR(255) NOT NULL,
    "type" INTEGER NOT NULL,
    "free_space_category" INTEGER NOT NULL,
    "comments" TEXT,
    "creation_year" VARCHAR(255),
    "reform_year" VARCHAR(255),
    "mayor_creation" VARCHAR(255),
    "legislation" VARCHAR(255),
    "useful_area" INTEGER,
    "area_pjf" INTEGER,
    "angle_inclination" INTEGER,
    "urban_region" BOOLEAN,
    "inactive_not_found" BOOLEAN,
    "address_id" INTEGER,
    "createdAt" TIMESTAMPTZ(6),
    "updatedAt" TIMESTAMPTZ(6),

    CONSTRAINT "locals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "numericfield" (
    "id" SERIAL NOT NULL,
    "min" DOUBLE PRECISION,
    "max" DOUBLE PRECISION,
    "id_field" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "numericfield_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "option" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "id_optionfield" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "optionfield" (
    "id" SERIAL NOT NULL,
    "option_limit" INTEGER NOT NULL,
    "total_options" INTEGER NOT NULL,
    "visual_preference" INTEGER NOT NULL,
    "id_field" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "optionfield_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_category" (
    "id" SERIAL NOT NULL,
    "age_rating" INTEGER,
    "physical_activity" BOOLEAN,
    "deficiency_person" BOOLEAN,
    "illegal_activity" BOOLEAN,
    "homeless" BOOLEAN,
    "quantity" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "person_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "textfield" (
    "id" SERIAL NOT NULL,
    "char_limit" INTEGER,
    "id_field" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "textfield_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" INTEGER NOT NULL,
    "phone_number" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_locals_id_fkey" FOREIGN KEY ("locals_id") REFERENCES "locals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_forms_id_fkey" FOREIGN KEY ("forms_id") REFERENCES "forms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "form-structure" ADD CONSTRAINT "form-structure_id_forms_fields_fkey" FOREIGN KEY ("id_forms_fields") REFERENCES "forms-fields"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "form-structure" ADD CONSTRAINT "form-structure_id_forms_fkey" FOREIGN KEY ("id_forms") REFERENCES "forms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "forms-fields" ADD CONSTRAINT "forms-fields_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "numericfield" ADD CONSTRAINT "numericfield_id_field_fkey" FOREIGN KEY ("id_field") REFERENCES "forms-fields"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "option" ADD CONSTRAINT "option_id_optionfield_fkey" FOREIGN KEY ("id_optionfield") REFERENCES "optionfield"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "optionfield" ADD CONSTRAINT "optionfield_id_field_fkey" FOREIGN KEY ("id_field") REFERENCES "forms-fields"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "textfield" ADD CONSTRAINT "textfield_id_field_fkey" FOREIGN KEY ("id_field") REFERENCES "forms-fields"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

