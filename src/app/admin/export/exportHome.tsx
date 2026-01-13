"use client";

import LocationSelector from "@/app/admin/export/locationSelector";
import { FetchLocationsResponse } from "@/lib/serverFunctions/queries/location";
import { Paper } from "@mui/material";
import { useState } from "react";

import { SelectedLocationObj } from "./client";
import SelectedParks from "./selectedParks";

const ExportHome = () => {
  const [selectedLocationsObjs, setSelectedLocationsObjs] = useState<
    SelectedLocationObj[]
  >([]);

  const handleSelectedLocationsAddition = (
    locationObj: FetchLocationsResponse["locations"][number],
  ) => {
    setSelectedLocationsObjs((prev) => [
      ...prev,
      {
        ...locationObj,
        tallysIds: [],
        assessments: [],
        exportRegistrationInfo: false,
      },
    ]);
  };
  const handleSelectedLocationsRemoval = (id: number) => {
    if (selectedLocationsObjs.some((location) => location.id === id)) {
      setSelectedLocationsObjs((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleSelectedLocationObjChange = (
    locationObj: SelectedLocationObj,
  ) => {
    setSelectedLocationsObjs((prev) =>
      prev.map((item) => (item.id === locationObj.id ? locationObj : item)),
    );
  };
  return (
    <div className="flex h-full flex-row justify-center gap-5 overflow-auto">
      <div className="hidden basis-3/5 flex-col gap-1 overflow-auto md:flex">
        <h4 className="text-xl font-semibold">
          Selecione as praças as quais deseja exportar dados
        </h4>
        <LocationSelector
          onSelecion={(v) => {
            handleSelectedLocationsAddition(v);
          }}
          selectedLocations={selectedLocationsObjs}
        />
      </div>

      <Paper
        elevation={5}
        className="flex w-full flex-col gap-2 overflow-auto p-2 md:w-fit md:basis-2/5"
      >
        <h4 className="text-xl font-semibold">Praças selecionadas</h4>

        <SelectedParks
          selectedLocationsObjs={selectedLocationsObjs}
          handleSelectedLocationsRemoval={handleSelectedLocationsRemoval}
          handleSelectedLocationObjChange={handleSelectedLocationObjChange}
        />
      </Paper>
    </div>
  );
};

export { ExportHome };
