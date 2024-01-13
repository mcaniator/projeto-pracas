-- CreateIndex
CREATE INDEX "location_idx" ON "noise" USING GIST ("point");
