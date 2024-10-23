-- CreateTable
CREATE TABLE "_CalculationToForm" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CalculationToForm_AB_unique" ON "_CalculationToForm"("A", "B");

-- CreateIndex
CREATE INDEX "_CalculationToForm_B_index" ON "_CalculationToForm"("B");

-- AddForeignKey
ALTER TABLE "_CalculationToForm" ADD CONSTRAINT "_CalculationToForm_A_fkey" FOREIGN KEY ("A") REFERENCES "calculation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CalculationToForm" ADD CONSTRAINT "_CalculationToForm_B_fkey" FOREIGN KEY ("B") REFERENCES "form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
