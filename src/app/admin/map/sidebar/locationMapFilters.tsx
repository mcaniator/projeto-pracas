
"use client";

import CAccordion from "@/components/ui/accordion/CAccordion";
import CAccordionDetails from "@/components/ui/accordion/CAccordionDetails";
import CAccordionSummary from "@/components/ui/accordion/CAccordionSummary";
import CAutocomplete from "@/components/ui/cAutoComplete";
import CSwitch from "@/components/ui/cSwtich";
import CTextField from "@/components/ui/cTextField";
import { LocationsMapClientFilter } from "@/app/admin/map/PolygonsAndClientContainer";
import { FetchCitiesResponse } from "@/lib/serverFunctions/queries/city";
import { FetchLocationCategoriesResponse } from "@/lib/serverFunctions/queries/locationCategory";
import { FetchLocationTypesResponse } from "@/lib/serverFunctions/queries/locationType";
import { Chip } from "@mui/material";
import { BrazilianStates } from "@prisma/client";
import { IconFilter } from "@tabler/icons-react";
import { Dispatch, SetStateAction, useMemo } from "react";

type City = FetchCitiesResponse["cities"][number];

type LocationsMapFiltersProps = {
  citiesOptions: FetchCitiesResponse["cities"] | null;
  filter: LocationsMapClientFilter;
  loadingCities: boolean;
  locationCategories: FetchLocationCategoriesResponse["categories"];
  locationTypes: FetchLocationTypesResponse["types"];
  selectedCity: City | null;
  setCity: Dispatch<SetStateAction<City | null>>;
  setFilter: Dispatch<SetStateAction<LocationsMapClientFilter>>;
  setState: Dispatch<SetStateAction<BrazilianStates>>;
  state: BrazilianStates;
  categoryLabel?: string;
  showOnlyPublic?: boolean;
  showActiveFiltersCount?: boolean;
};

const LocationsMapFilters = ({
  citiesOptions,
  filter,
  loadingCities,
  locationCategories,
  locationTypes,
  selectedCity,
  setCity,
  setFilter,
  setState,
  state,
  categoryLabel = "Categoria",
  showOnlyPublic = false,
  showActiveFiltersCount = false,
}: LocationsMapFiltersProps) => {
  const broadUnits = useMemo(
    () => [
      ...(selectedCity?.broadAdministrativeUnit ?? []),
      { id: -1, name: "NENHUMA" },
    ],
    [selectedCity?.broadAdministrativeUnit],
  );

  const intermediateUnits = useMemo(
    () => [
      ...(selectedCity?.intermediateAdministrativeUnit ?? []),
      { id: -1, name: "NENHUMA" },
    ],
    [selectedCity?.intermediateAdministrativeUnit],
  );

  const narrowUnits = useMemo(
    () => [
      ...(selectedCity?.narrowAdministrativeUnit ?? []),
      { id: -1, name: "NENHUMA" },
    ],
    [selectedCity?.narrowAdministrativeUnit],
  );

  const locationCategoriesOptions = useMemo(
    () => [...locationCategories, { id: -1, name: "NENHUMA" }],
    [locationCategories],
  );

  const locationTypesOptions = useMemo(
    () => [...locationTypes, { id: -1, name: "NENHUMA" }],
    [locationTypes],
  );

  const numberOfActiveFilters = [
    filter.broadAdministrativeUnitId,
    filter.intermediateAdministrativeUnitId,
    filter.narrowAdministrativeUnitId,
    filter.categoryId,
    filter.typeId,
  ].filter((value) => value !== null).length;

  return (
    <>
      <div className="flex">
        <CAutocomplete
          className="w-32"
          label="Estado"
          disableClearable
          options={Object.values(BrazilianStates)}
          value={state}
          onChange={(_, value) => setState(value)}
        />

        <CAutocomplete
          className="w-full"
          label="Cidade"
          loading={loadingCities}
          value={
            citiesOptions?.find((city) => city.id === selectedCity?.id) ?? {
              id: -1,
              name: "Nenhuma cidade selecionada",
              state,
              broadAdministrativeUnit: [],
              intermediateAdministrativeUnit: [],
              narrowAdministrativeUnit: [],
              broadAdministrativeUnitTitle: null,
              intermediateAdministrativeUnitTitle: null,
              narrowAdministrativeUnitTitle: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          }
          disableClearable
          options={citiesOptions ?? []}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          getOptionLabel={(option) => option.name}
          onChange={(_, value) => setCity(value)}
        />
      </div>

      <CAccordion sx={{ "&.Mui-expanded": { margin: 0 } }}>
        <CAccordionSummary>
          <div className="flex flex-row items-center">
            <IconFilter /> Filtros

            {showActiveFiltersCount && numberOfActiveFilters > 0 && (
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
            {!!selectedCity?.broadAdministrativeUnitTitle && (
              <CAutocomplete
                label={selectedCity.broadAdministrativeUnitTitle}
                options={broadUnits}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                loading={loadingCities}
                value={
                  broadUnits.find(
                    (unit) => unit.id === filter.broadAdministrativeUnitId,
                  ) ?? null
                }
                onChange={(_, value) =>
                  setFilter((prev) => ({
                    ...prev,
                    broadAdministrativeUnitId: value?.id ?? null,
                  }))
                }
              />
            )}

            {!!selectedCity?.intermediateAdministrativeUnitTitle && (
              <CAutocomplete
                label={selectedCity.intermediateAdministrativeUnitTitle}
                options={intermediateUnits}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                loading={loadingCities}
                value={
                  intermediateUnits.find(
                    (unit) =>
                      unit.id === filter.intermediateAdministrativeUnitId,
                  ) ?? null
                }
                onChange={(_, value) =>
                  setFilter((prev) => ({
                    ...prev,
                    intermediateAdministrativeUnitId: value?.id ?? null,
                  }))
                }
              />
            )}

            {!!selectedCity?.narrowAdministrativeUnitTitle && (
              <CAutocomplete
                label={selectedCity.narrowAdministrativeUnitTitle}
                options={narrowUnits}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                loading={loadingCities}
                value={
                  narrowUnits.find(
                    (unit) => unit.id === filter.narrowAdministrativeUnitId,
                  ) ?? null
                }
                onChange={(_, value) =>
                  setFilter((prev) => ({
                    ...prev,
                    narrowAdministrativeUnitId: value?.id ?? null,
                  }))
                }
              />
            )}

            <CAutocomplete
              label={categoryLabel}
              options={locationCategoriesOptions}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              value={
                locationCategoriesOptions.find(
                  (option) => option.id === filter.categoryId,
                ) ?? null
              }
              onChange={(_, value) =>
                setFilter((prev) => ({
                  ...prev,
                  categoryId: value?.id ?? null,
                }))
              }
            />

            <CAutocomplete
              label="Tipo"
              options={locationTypesOptions}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              value={
                locationTypesOptions.find(
                  (option) => option.id === filter.typeId,
                ) ?? null
              }
              onChange={(_, value) =>
                setFilter((prev) => ({
                  ...prev,
                  typeId: value?.id ?? null,
                }))
              }
            />

            {showOnlyPublic && (
              <CSwitch
                label="Apenas visibilidade pública"
                checked={filter.onlyPublic}
                onChange={(_, checked) =>
                  setFilter((prev) => ({
                    ...prev,
                    onlyPublic: checked,
                  }))
                }
              />
            )}
          </div>
        </CAccordionDetails>
      </CAccordion>

      <CTextField
        label="Nome"
        value={filter.name}
        clearable
        debounce={500}
        onChange={(event) =>
          setFilter((prev) => ({
            ...prev,
            name: event.target.value,
          }))
        }
      />
    </>
  );
};

export default LocationsMapFilters;
