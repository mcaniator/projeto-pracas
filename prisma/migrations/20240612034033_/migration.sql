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

-- AddForeignKey
ALTER TABLE "responseOption" ADD CONSTRAINT "responseOption_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responseOption" ADD CONSTRAINT "responseOption_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responseOption" ADD CONSTRAINT "responseOption_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responseOption" ADD CONSTRAINT "responseOption_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "option"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
