-- CreateTable
CREATE TABLE "CustomIcon" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "aliases" TEXT[],
    "body" TEXT NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CustomIcon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomIcon_name_idx" ON "CustomIcon"("name");

-- CreateIndex
CREATE INDEX "CustomIcon_aliases_idx" ON "CustomIcon"("aliases");
