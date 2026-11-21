-- AlterTable
ALTER TABLE "category" ADD COLUMN     "allow_geometry_association" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "geometry_types" "QuestionGeometryTypes"[] DEFAULT ARRAY[]::"QuestionGeometryTypes"[];

-- AlterTable
ALTER TABLE "subcategory" ADD COLUMN     "allow_geometry_association" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "geometry_types" "QuestionGeometryTypes"[] DEFAULT ARRAY[]::"QuestionGeometryTypes"[];

-- CreateTable
CREATE TABLE "form_item_geometry" (
    "id" SERIAL NOT NULL,
    "form_item_id" INTEGER NOT NULL,
    "geometry" Geometry,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_item_geometry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "form_item_geometry" ADD CONSTRAINT "form_item_geometry_form_item_id_fkey" FOREIGN KEY ("form_item_id") REFERENCES "form_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
