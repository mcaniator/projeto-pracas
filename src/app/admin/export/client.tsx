"use client";

import { Button } from "@/components/button";
import { IconCircleMinus } from "@tabler/icons-react";
import { useState } from "react";

import { ParkSearch } from "./parkSearch";

const ExportClientPage = ({
  locations,
}: {
  locations: { id: number; name: string }[];
}) => {
  const [selectedLocations, setSelectedLocations] = useState<number[]>([]);
  const handleSelectedLocationsAddition = (id: number) => {
    if (!selectedLocations.includes(id)) {
      setSelectedLocations((prev) => [...prev, id]);
    }
  };
  const handleSelectedLocationsRemoval = (id: number) => {
    if (selectedLocations.includes(id)) {
      setSelectedLocations((prev) => prev.filter((item) => item !== id));
    }
  };
  return (
    <div className="flex max-h-full min-h-0 max-w-full gap-5 p-5">
      <div className="flex flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 text-white shadow-md">
        <h3 className="text-2xl font-semibold">Exportar dados</h3>
        <div className="flex flex-row gap-5">
          <div className="flex flex-col gap-1">
            <h4 className="text-xl font-semibold">
              Selecione as praças as quais deseja exportar dados
            </h4>
            <ParkSearch
              location={locations}
              selectedLocations={selectedLocations}
              handleSelectedLocationsAddition={handleSelectedLocationsAddition}
            />
          </div>

          <div className="w-fit rounded-3xl bg-gray-400/20 p-3 text-white shadow-inner">
            <h4 className="text-xl font-semibold">Praças selecionadas</h4>
            {selectedLocations.map((locationId, index) => {
              const locationObject = locations.find(
                (item) => item.id === locationId,
              );
              return (
                <div
                  className="mb-2 flex items-center justify-between rounded bg-white p-2 text-black"
                  key={index}
                >
                  {locationObject?.name}
                  <Button
                    onPress={() => {
                      handleSelectedLocationsRemoval(locationId);
                    }}
                    variant={"ghost"}
                  >
                    <IconCircleMinus size={24} />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export { ExportClientPage };
