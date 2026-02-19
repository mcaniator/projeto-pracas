"use client";

import { LocationsMapClientFilter } from "@/app/admin/map/PolygonsAndClientContainer";
import { MapContext } from "@/app/admin/map/mapProvider";
import CButton from "@/components/ui/cButton";
import CDialog from "@/components/ui/dialog/cDialog";
import { FetchLocationsResponse } from "@/lib/serverFunctions/queries/location";
import { FetchLocationCategoriesResponse } from "@/lib/serverFunctions/queries/locationCategory";
import { FetchLocationTypesResponse } from "@/lib/serverFunctions/queries/locationType";
import CImage from "@components/ui/CImage";
import { Chip, LinearProgress } from "@mui/material";
import { BrazilianStates } from "@prisma/client";
import {
  IconFilter,
  IconListDetails,
  IconMap,
  IconSquareRoundedCheck,
  IconTree,
} from "@tabler/icons-react";
import { createEmpty, extend, isEmpty } from "ol/extent";
import GeoJSON from "ol/format/GeoJSON";
import { Dispatch, SetStateAction, useContext, useMemo, useState } from "react";
import { Virtuoso } from "react-virtuoso";

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
  isMobileView,
  selectedLocationId,
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
  selectedLocationId: number | null;
  selectLocation: (locationId: number) => void;
  setState: Dispatch<SetStateAction<BrazilianStates>>;
  setCity: Dispatch<
    SetStateAction<FetchCitiesResponse["cities"][number] | null>
  >;
  setFilter: Dispatch<SetStateAction<LocationsMapClientFilter>>;
  isMobileView: boolean;
}) => {
  const map = useContext(MapContext);
  const view = map?.getView();
  const [mobileDialogOpen, setMobileDialogOpen] = useState(false);
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

  const handleShowLocationOnMap = (locationId: number) => {
    //This is used to show the location on the map after selecting it in the list on mobile.
    const location = locations.find((loc) => loc.id === locationId);
    if (location) {
      const st = location.st_asgeojson;
      const reader = new GeoJSON();
      const geometry = reader.readGeometry(st);
      if (geometry) {
        const extent = createEmpty();
        extend(extent, geometry.getExtent());
        if (!isEmpty(extent)) {
          view?.fit(extent, {
            padding: [100, 100, 100, 100],
          });
        }
        setMobileDialogOpen(false);
      }
    }
  };

  const inner = (
    <div className="flex h-full max-h-full flex-col gap-1 overflow-y-auto overflow-x-hidden">
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
            {!!selectedCity?.broadAdministrativeUnitTitle && (
              <CAutocomplete
                label={selectedCity?.broadAdministrativeUnitTitle}
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
            )}
            {!!selectedCity?.intermediateAdministrativeUnitTitle && (
              <CAutocomplete
                label={selectedCity?.intermediateAdministrativeUnitTitle}
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
            )}
            {!!selectedCity?.narrowAdministrativeUnitTitle && (
              <CAutocomplete
                label={selectedCity?.narrowAdministrativeUnitTitle}
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
            )}

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
              value={locationTypes?.find((b) => b.id === filter.typeId) ?? null}
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
        clearable
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
      <Virtuoso
        data={locations}
        style={{ height: "100%", overflowX: "hidden", minHeight: "300px" }}
        itemContent={(_, location) => {
          const isSelected = selectedLocationId === location.id;
          return (
            <div className="pb-2">
              {/*pb is required for Virtuoso to work properly with spacing between items*/}
              <div
                onClick={() => selectLocation(location.id)}
                className={`relative flex h-24 shrink-0 cursor-pointer items-end overflow-hidden rounded-xl border shadow-sm transition hover:scale-[1.02] hover:shadow-md`}
              >
                {location.mainImage ?
                  <CImage
                    src={location.mainImage}
                    alt={location.name}
                    fill
                    className="absolute inset-0 h-full w-full scale-110 object-cover blur-sm"
                  />
                : <div className="absolute inset-0 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                      <IconTree size={48} />
                    </div>
                  </div>
                }
                {isSelected && (
                  <div className="absolute right-2 top-2 z-20 rounded-md bg-green-600 text-white shadow">
                    <IconSquareRoundedCheck />
                  </div>
                )}
                {isMobileView && (
                  <div className="absolute right-2 top-2 z-20">
                    <CButton
                      square
                      tooltip="Mostrar no mapa"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowLocationOnMap(location.id);
                      }}
                    >
                      <IconMap />
                    </CButton>
                  </div>
                )}

                <div
                  className={`absolute inset-0 ${
                    isSelected ? "bg-black/30" : "bg-black/50"
                  }`}
                />

                <div className="relative z-10 p-3 text-white">
                  <div className="text-sm font-semibold leading-tight">
                    {location.name}
                  </div>
                  <div className="text-xs text-white/80">
                    {location.popularName}
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      />
    </div>
  );

  if (isMobileView) {
    return (
      <>
        <CDialog
          fullScreen
          title="Praças"
          open={mobileDialogOpen}
          onClose={() => {
            setMobileDialogOpen(false);
          }}
        >
          {inner}
        </CDialog>
        <div className="pointer-events-auto flex w-full justify-between">
          <CButton
            square={true}
            enableTopLeftChip
            topLeftChipLabel={locations.length}
            onClick={() => {
              setMobileDialogOpen(true);
            }}
          >
            <IconListDetails />
          </CButton>
          <div className="ml-1 flex w-full gap-1">
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
              getOptionLabel={(o) => o.name}
              onChange={(_, v) => setCity(v)}
            />
          </div>
        </div>
      </>
    );
  } else {
    return (
      <div
        className="pointer-events-auto flex max-h-full w-96 flex-col gap-1 overflow-auto rounded-xl bg-white p-1 text-black"
        style={{ boxShadow: "0px 0px 10px 5px rgba(0, 0, 0, 0.1)" }}
      >
        {inner}
      </div>
    );
  }
};

export default Sidebar;
