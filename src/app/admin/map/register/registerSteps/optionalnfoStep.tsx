"use client";

import CNumberField from "@/components/ui/cNumberField";
import CTextField from "@/components/ui/cTextField";
import { ParkRegisterData } from "@/lib/types/parks/parkRegister";
import { Divider } from "@mui/material";
import { useEffect } from "react";

const OptionalInfoStep = ({
  parkData,
  setEnableNextStep,
  setParkData,
}: {
  parkData: ParkRegisterData;
  setEnableNextStep: React.Dispatch<React.SetStateAction<boolean>>;
  setParkData: React.Dispatch<React.SetStateAction<ParkRegisterData>>;
}) => {
  useEffect(() => {
    setEnableNextStep(true);
  });
  return (
    <div className="flex flex-col gap-1">
      <Divider />
      <h3>Características físicas</h3>
      <CNumberField
        label="Área prefeitura(m²)"
        value={parkData.legalArea}
        onChange={(v) => {
          setParkData((prev) => ({ ...prev, legalArea: v }));
        }}
      />
      <CNumberField
        label="Área útil(m²)"
        value={parkData.usableArea}
        onChange={(v) => {
          setParkData((prev) => ({ ...prev, usableArea: v }));
        }}
      />
      <CNumberField
        label="Inclinação(%)"
        value={parkData.incline}
        onChange={(v) => {
          setParkData((prev) => ({ ...prev, incline: v }));
        }}
      />
      <Divider />
      <h3>Histórico</h3>
      <CNumberField
        label="Ano de criação "
        value={parkData.creationYear}
        onChange={(v) => {
          setParkData((prev) => ({ ...prev, creationYear: v }));
        }}
      />

      <CNumberField
        label="Ano reforma"
        value={parkData.lastMaintenanceYear}
        onChange={(v) => {
          setParkData((prev) => ({ ...prev, lastMaintenanceYear: v }));
        }}
      />
      <CTextField
        label="Legislação"
        value={parkData.legislation}
        onChange={(e) => {
          setParkData((prev) => ({ ...prev, legislation: e.target.value }));
        }}
        maxCharacters={255}
      />
      <Divider />
      <h3>Observações gerais</h3>
      <CTextField
        label="Observações"
        value={parkData.notes}
        onChange={(e) => {
          setParkData((prev) => ({ ...prev, notes: e.target.value }));
        }}
        multiline
        maxCharacters={1024}
      />
    </div>
  );
};
export default OptionalInfoStep;
