"use client";

import { LocationsMapClientFilter } from "@/app/admin/map/PolygonsAndClientContainer";
import { FetchLocationsResponse } from "@/lib/serverFunctions/queries/location";
import { FetchLocationCategoriesResponse } from "@/lib/serverFunctions/queries/locationCategory";
import { FetchLocationTypesResponse } from "@/lib/serverFunctions/queries/locationType";
import CImage from "@components/ui/CImage";
import { Chip, LinearProgress } from "@mui/material";
import { BrazilianStates } from "@prisma/client";
import { IconFilter, IconTree } from "@tabler/icons-react";
import { Dispatch, SetStateAction, useMemo } from "react";

import CAccordion from "../../../../components/ui/accordion/CAccordion";
import CAccordionDetails from "../../../../components/ui/accordion/CAccordionDetails";
import CAccordionSummary from "../../../../components/ui/accordion/CAccordionSummary";
import CAutocomplete from "../../../../components/ui/cAutoComplete";
import CTextField from "../../../../components/ui/cTextField";
import { FetchCitiesResponse } from "../../../../lib/serverFunctions/queries/city";

const Sidebar = ({
  loadingLocations,
  loadingCities,
  loadingCategories,
  loadingTypes,
  locations,
  citiesOptions,
  locationCategories,
  locationTypes,
  selectedCity,
  numberOfActiveFilters,
  state,
  filter,
  selectLocation,
  setState,
  setCity,
  setFilter,
}: {
  loadingLocations: boolean;
  loadingCities: boolean;
  loadingCategories: boolean;
  loadingTypes: boolean;
  locations: FetchLocationsResponse["locations"];
  locationCategories: FetchLocationCategoriesResponse["categories"];
  locationTypes: FetchLocationTypesResponse["types"];
  selectedCity: FetchCitiesResponse["cities"][number] | null;
  citiesOptions: FetchCitiesResponse["cities"] | null;
  numberOfActiveFilters: number;
  state: BrazilianStates;
  filter: LocationsMapClientFilter;
  selectLocation: (locationId: number) => void;
  setState: Dispatch<SetStateAction<BrazilianStates>>;
  setCity: Dispatch<
    SetStateAction<FetchCitiesResponse["cities"][number] | null>
  >;
  setFilter: Dispatch<SetStateAction<LocationsMapClientFilter>>;
}) => {
  const broadUnits = useMemo(() => {
    return [
      ...(selectedCity?.broadAdministrativeUnit ?? []),
      { id: -1, name: "NENHUMA" },
    ];
  }, [selectedCity?.broadAdministrativeUnit]);
  const intermediateUnits = useMemo(() => {
    return [
      ...(selectedCity?.intermediateAdministrativeUnit ?? []),
      { id: -1, name: "NENHUMA" },
    ];
  }, [selectedCity?.intermediateAdministrativeUnit]);
  const narrowUnits = useMemo(() => {
    return [
      ...(selectedCity?.narrowAdministrativeUnit ?? []),
      { id: -1, name: "NENHUMA" },
    ];
  }, [selectedCity?.narrowAdministrativeUnit]);
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
            loading={loadingCities}
            value={
              citiesOptions?.find((c) => c.id === selectedCity?.id) ?? {
                id: -1,
                name: "Nenhuma cidade selecionada",
                state: state,
                broadAdministrativeUnit: [],
                intermediateAdministrativeUnit: [],
                narrowAdministrativeUnit: [],
                createdAt: new Date(),
                updatedAt: new Date(),
              }
            }
            disableClearable
            options={citiesOptions ?? []}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionLabel={(o) => o.name}
            onChange={(_, v) => setCity(v)}
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
            <div className="flex flex-row items-center">
              <IconFilter /> Filtros
              {numberOfActiveFilters > 0 && (
                <Chip
                  color="error"
                  label={numberOfActiveFilters}
                  sx={{ fontSize: "0.7rem", ml: "4px", height: "28px" }}
                />
              )}
            </div>
          </CAccordionSummary>
          <CAccordionDetails>
            <div className="flex flex-col gap-1">
              <CAutocomplete
                label="Região administrativa ampla"
                options={broadUnits}
                getOptionLabel={(o) => o.name}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                loading={loadingCities}
                value={
                  broadUnits.find(
                    (b) => b.id === filter.broadAdministrativeUnitId,
                  ) ?? null
                }
                onChange={(_, v) =>
                  setFilter({
                    ...filter,
                    broadAdministrativeUnitId: v?.id ?? null,
                  })
                }
              />
              <CAutocomplete
                label="Região administrativa intermendiária"
                options={intermediateUnits}
                getOptionLabel={(o) => o.name}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                loading={loadingCities}
                value={
                  intermediateUnits.find(
                    (b) => b.id === filter.intermediateAdministrativeUnitId,
                  ) ?? null
                }
                onChange={(_, v) =>
                  setFilter({
                    ...filter,
                    intermediateAdministrativeUnitId: v?.id ?? null,
                  })
                }
              />
              <CAutocomplete
                label="Região administrativa estreita"
                options={narrowUnits}
                getOptionLabel={(o) => o.name}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                loading={loadingCities}
                value={
                  narrowUnits.find(
                    (b) => b.id === filter.narrowAdministrativeUnitId,
                  ) ?? null
                }
                onChange={(_, v) =>
                  setFilter({
                    ...filter,
                    narrowAdministrativeUnitId: v?.id ?? null,
                  })
                }
              />
              <CAutocomplete
                label="Categoria"
                options={[...locationCategories, { id: -1, name: "NENHUMA" }]}
                loading={loadingCategories}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                getOptionLabel={(o) => o.name}
                value={
                  locationCategories?.find((b) => b.id === filter.categoryId) ??
                  null
                }
                onChange={(_, v) =>
                  setFilter({
                    ...filter,
                    categoryId: v?.id ?? null,
                  })
                }
              />
              <CAutocomplete
                label="Tipo"
                options={[...locationTypes, { id: -1, name: "NENHUM" }]}
                loading={loadingTypes}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                getOptionLabel={(o) => o.name}
                value={
                  locationTypes?.find((b) => b.id === filter.typeId) ?? null
                }
                onChange={(_, v) =>
                  setFilter({
                    ...filter,
                    typeId: v?.id ?? null,
                  })
                }
              />
            </div>
          </CAccordionDetails>
        </CAccordion>
        <CTextField
          label="Nome"
          value={filter.name}
          debounce={500}
          onChange={(e) => {
            setFilter((prev) => ({ ...prev, name: e.target.value }));
          }}
        />
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
              <CImage
                src={location.mainImage}
                alt="Praça"
                width={60}
                height={60}
                fallback={
                  <div className="aspect-square rounded-full bg-gray-200 outline outline-1 outline-gray-300">
                    <IconTree size={60} />
                  </div>
                }
                className="aspect-square rounded-full"
              />
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
