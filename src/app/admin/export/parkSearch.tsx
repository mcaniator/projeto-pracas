"use client";

import { Button } from "@/components/button";
import { search } from "@/lib/search";
import { IconCirclePlus } from "@tabler/icons-react";
import Fuse, { FuseResult } from "fuse.js";
import { useState } from "react";
import React from "react";

import { Input } from "../../../components/ui/input";
import { SelectedLocationObj } from "./client";

const LocationComponent = ({
  id,
  name,
  handleSelectedLocationsAddition,
}: {
  id: number;
  name: string;
  handleSelectedLocationsAddition: (locationObj: SelectedLocationObj) => void;
}) => {
  return (
    <div
      key={id}
      className="mb-2 flex items-center justify-between rounded bg-white p-2"
    >
      {name}
      <Button
        className="text-black"
        onPress={() => {
          handleSelectedLocationsAddition({
            id,
            tallysIds: [],
            assessments: [],
            exportRegistrationInfo: false,
          });
        }}
        variant={"ghost"}
      >
        <IconCirclePlus size={24} />
      </Button>
    </div>
  );
};

const LocationList = ({
  locations,
  selectedLocations,
  handleSelectedLocationsAddition,
}: {
  locations: FuseResult<{ id: number; name: string }>[];
  selectedLocations: SelectedLocationObj[];
  handleSelectedLocationsAddition: (locationObj: SelectedLocationObj) => void;
}) => {
  return (
    <div className="w-full overflow-auto text-black">
      {locations.map(
        (location, index) =>
          !selectedLocations.some(
            (selectedLocation) => selectedLocation.id === location.item.id,
          ) && (
            <LocationComponent
              key={index}
              id={location.item.id}
              name={location.item.name}
              handleSelectedLocationsAddition={handleSelectedLocationsAddition}
            />
          ),
      )}
    </div>
  );
};

const ParkSearch = ({
  location,
  selectedLocations,
  handleSelectedLocationsAddition,
}: {
  location: { id: number; name: string }[];
  selectedLocations: SelectedLocationObj[];
  handleSelectedLocationsAddition: (locationObj: SelectedLocationObj) => void;
}) => {
  const fuseHaystack = new Fuse(location, { keys: ["name"] });
  const [hay, setHay] = useState(search("", location, fuseHaystack));

  return (
    <>
      <div className={"flex flex-col gap-2"}>
        <label htmlFor={"name"}>Buscar pelo nome:</label>
        <Input
          type="text"
          name="name"
          id={"name"}
          autoComplete={"none"}
          onChange={(e) => {
            setHay(search(e.target.value, location, fuseHaystack));
          }}
        />
      </div>

      <LocationList
        locations={hay}
        selectedLocations={selectedLocations}
        handleSelectedLocationsAddition={handleSelectedLocationsAddition}
      />
    </>
  );
};

export { ParkSearch };
