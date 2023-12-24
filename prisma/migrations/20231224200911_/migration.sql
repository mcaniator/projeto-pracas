-- CreateTable
CREATE TABLE "form" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "form_pkey" PRIMARY KEY ("id")
);
