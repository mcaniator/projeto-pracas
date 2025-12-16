"use client";

import { FetchLocationsResponse } from "@/lib/serverFunctions/queries/location";
import { LinearProgress } from "@mui/material";
import { BrazilianStates } from "@prisma/client";
import { IconFilter, IconTree } from "@tabler/icons-react";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import CAccordion from "../../../../components/ui/accordion/CAccordion";
import CAccordionDetails from "../../../../components/ui/accordion/CAccordionDetails";
import CAccordionSummary from "../../../../components/ui/accordion/CAccordionSummary";
import CAutocomplete from "../../../../components/ui/cAutoComplete";
import CTextField from "../../../../components/ui/cTextField";
import { FetchCitiesResponse } from "../../../../lib/serverFunctions/queries/city";

type UnitType =
  FetchCitiesResponse["cities"][number]["narrowAdministrativeUnit"];

const Sidebar = ({
  loadingLocations,
  locations,
  citiesOptions,
  cityId,
  state,
  selectLocation,
  setState,
  setCityId,
}: {
  loadingLocations: boolean;
  locations: FetchLocationsResponse["locations"];
  cityId: number | null;
  citiesOptions: FetchCitiesResponse["cities"] | null;
  state: BrazilianStates;
  selectLocation: (locationId: number) => void;
  setState: Dispatch<SetStateAction<BrazilianStates>>;
  setCityId: Dispatch<SetStateAction<number | null>>;
}) => {
  const [cityAdmUnits, setCityAdmUnits] = useState<{
    narrowUnits: UnitType;
    intermediateUnits: UnitType;
    broadUnits: UnitType;
  }>({
    narrowUnits: [],
    intermediateUnits: [],
    broadUnits: [],
  });

  useEffect(() => {
    const cityOption = citiesOptions?.find((c) => c.id === cityId);
    setCityAdmUnits({
      broadUnits: cityOption?.broadAdministrativeUnit ?? [],
      intermediateUnits: cityOption?.intermediateAdministrativeUnit ?? [],
      narrowUnits: cityOption?.narrowAdministrativeUnit ?? [],
    });
  }, [citiesOptions, cityId]);
  return (
    <div
      className="flex max-h-full w-96 flex-col gap-1 overflow-auto rounded-xl bg-white p-1 text-black"
      style={{ boxShadow: "0px 0px 10px 5px rgba(0, 0, 0, 0.1)" }}
    >
      <div className="flex max-h-full flex-col gap-1 overflow-auto">
        <div className="flex">
          <CAutocomplete
            className="w-32"
            label="Estado"
            disableClearable
            options={Object.values(BrazilianStates)}
            value={state}
            onChange={(_, v) => setState(v)}
          />
          <CAutocomplete
            className="w-full"
            label="Cidade"
            value={
              citiesOptions?.find((c) => c.id === cityId) ?? {
                id: -1,
                name: "Nenhuma cidade selecionada",
              }
            }
            disableClearable
            options={citiesOptions ?? []}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionLabel={(o) => o.name}
            onChange={(_, v) => setCityId(v.id)}
          />
        </div>

        <CAccordion
          sx={{
            "&.Mui-expanded": {
              margin: 0,
            },
          }}
        >
          <CAccordionSummary>
            <div className="flex flex-row">
              <IconFilter /> Filtros
            </div>
          </CAccordionSummary>
          <CAccordionDetails>
            <div className="flex flex-col gap-1">
              <CTextField label="Nome" />
              <CAutocomplete
                label="Região administrativa ampla"
                options={cityAdmUnits.broadUnits ?? []}
                getOptionLabel={(o) => o.name}
                isOptionEqualToValue={(a, b) => a.id === b.id}
              />
              <CAutocomplete
                label="Região administrativa intermendiária"
                options={cityAdmUnits.intermediateUnits ?? []}
                getOptionLabel={(o) => o.name}
                isOptionEqualToValue={(a, b) => a.id === b.id}
              />
              <CAutocomplete
                label="Região administrativa estreita"
                options={cityAdmUnits.narrowUnits ?? []}
                getOptionLabel={(o) => o.name}
                isOptionEqualToValue={(a, b) => a.id === b.id}
              />
              <CAutocomplete label="Categoria" options={[]} />
              <CAutocomplete label="Tipo" options={[]} />
            </div>
          </CAccordionDetails>
        </CAccordion>
        {loadingLocations && (
          <div className="flex w-full flex-col justify-center text-lg">
            <LinearProgress />
            Carregando praças...
          </div>
        )}
        {locations.map((location) => {
          return (
            <div
              key={location.id}
              className="flex cursor-pointer border-b border-gray-300 p-2 hover:bg-gray-200"
              onClick={() => {
                selectLocation(location.id);
              }}
            >
              {location.image ?
                <Image
                  src={location.image}
                  alt="Praça"
                  width={60}
                  height={60}
                  className="aspect-square rounded-full"
                />
              : <div className="aspect-square rounded-full bg-gray-200 outline outline-1 outline-gray-300">
                  <IconTree size={60} />
                </div>
              }
              <div className="ml-2 flex flex-col">
                <div className="font-semibold">{location.name}</div>
                <div className="text-sm text-gray-500">
                  {location.popularName}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
