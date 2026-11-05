"use client";

import { LocationsMapClientFilter } from "@/app/admin/map/PolygonsAndClientContainer";
import CImage from "@/components/ui/CImage";
import CButton from "@/components/ui/cButton";
import CCheckbox from "@/components/ui/cCheckbox";
import { downloadCSVFileFromText } from "@/lib/downloadFile";
import { useAppSnackbar } from "@/lib/hooks/useAppSnackbar";
import { useExportRegistrationData } from "@/lib/serverFunctions/apiCalls/export";
import { FetchCitiesResponse } from "@/lib/serverFunctions/queries/city";
import { FetchLocationsResponse } from "@/lib/serverFunctions/queries/location";
import { FetchLocationCategoriesResponse } from "@/lib/serverFunctions/queries/locationCategory";
import { FetchLocationTypesResponse } from "@/lib/serverFunctions/queries/locationType";
import { Chip, Divider, LinearProgress } from "@mui/material";
import { BrazilianStates } from "@prisma/client";
import { IconTableExport, IconTree } from "@tabler/icons-react";
import { Dispatch, SetStateAction, useEffect } from "react";
import { Virtuoso } from "react-virtuoso";
import LocationsMapFilters from "./locationMapFilters";

export type ExportSidebarProps = {
  citiesOptions: FetchCitiesResponse["cities"] | null;
  filter: LocationsMapClientFilter;
  loadingCities: boolean;
  loadingLocations: boolean;
  locationCategories: FetchLocationCategoriesResponse["categories"];
  locations: FetchLocationsResponse["locations"];
  locationTypes: FetchLocationTypesResponse["types"];
  selectedCity: FetchCitiesResponse["cities"][number] | null;
  selectedLocationIds: Set<number>;
  setCity: Dispatch<
    SetStateAction<FetchCitiesResponse["cities"][number] | null>
  >;
  setFilter: Dispatch<SetStateAction<LocationsMapClientFilter>>;
  setSelectedLocationIds: Dispatch<SetStateAction<Set<number>>>;
  setState: Dispatch<SetStateAction<BrazilianStates>>;
  state: BrazilianStates;
};

const ExportSidebar = ({
  citiesOptions,
  filter,
  loadingCities,
  loadingLocations,
  locationCategories,
  locations,
  locationTypes,
  selectedCity,
  selectedLocationIds,
  setCity,
  setFilter,
  setSelectedLocationIds,
  setState,
  state,
}: ExportSidebarProps) => {
  const { enqueueSnackbar } = useAppSnackbar();
  const [exportRegistrationData, exporting] = useExportRegistrationData();

  useEffect(() => {
    const availableLocationIds = new Set(
      locations.map((location) => location.id),
    );
    setSelectedLocationIds((current) => {
      const next = new Set(
        [...current].filter((locationId) =>
          availableLocationIds.has(locationId),
        ),
      );
      if (next.size === current.size) return current;
      return next;
    });
  }, [locations, setSelectedLocationIds]);

  const toggleLocation = (locationId: number) => {
    setSelectedLocationIds((current) => {
      const next = new Set(current);
      if (next.has(locationId)) next.delete(locationId);
      else next.add(locationId);
      return next;
    });
  };

  const handleExport = async () => {
    const locationsIds =
      selectedLocationIds.size > 0 ?
        [...selectedLocationIds]
      : locations.map((location) => location.id);

    if (locationsIds.length === 0) {
      enqueueSnackbar(<>Nenhuma praça encontrada para exportação!</>, {
        variant: "warning",
      });
      return;
    }

    const result = await exportRegistrationData({ data: { locationsIds } });
    if (result.responseInfo.statusCode === 401) {
      enqueueSnackbar(<>Sem permissão para exportar dados de praças!</>, {
        variant: "error",
      });
      return;
    }
    if (result.responseInfo.statusCode !== 200 || !result.data?.CSVstring) {
      enqueueSnackbar(<>Erro ao exportar dados de praças!</>, {
        variant: "error",
      });
      return;
    }

    try {
      await downloadCSVFileFromText({
        filename: "Informações-Cadastro.csv",
        content: result.data.CSVstring,
      });
      enqueueSnackbar(<>Dados de praças exportados!</>, { variant: "success" });
    } catch {
      enqueueSnackbar(<>Não foi possível salvar o arquivo no dispositivo!</>, {
        variant: "error",
      });
    }
  };

  return (
    <div className="flex h-full max-h-full flex-col gap-1 overflow-y-auto overflow-x-hidden">
      <LocationsMapFilters
        citiesOptions={citiesOptions}
        filter={filter}
        loadingCities={loadingCities}
        locationCategories={locationCategories}
        locationTypes={locationTypes}
        selectedCity={selectedCity}
        setCity={setCity}
        setFilter={setFilter}
        setState={setState}
        state={state}
        showActiveFiltersCount
      />
      {(loadingLocations || loadingCities) && <LinearProgress />}
      <div className="flex items-center justify-between px-1">
        <span className="font-semibold">Praças para exportar</span>
        <Chip
          size="small"
          color={selectedLocationIds.size > 0 ? "primary" : "default"}
          label={
            selectedLocationIds.size > 0 ?
              `${selectedLocationIds.size} selecionada(s)`
            : "Todas"
          }
        />
      </div>
      <Virtuoso
        data={locations}
        components={{
          EmptyPlaceholder: () =>
            loadingLocations || loadingCities ? null : (
              <div>Nenhuma praça encontrada!</div>
            ),
        }}
        style={{ height: "100%", minHeight: "300px", overflowX: "hidden" }}
        itemContent={(_, location) => {
          const isSelected = selectedLocationIds.has(location.id);

          return (
            <div className="pb-2">
              <div
                onClick={() => toggleLocation(location.id)}
                className={`relative flex h-24 shrink-0 cursor-pointer items-end overflow-hidden rounded-xl border shadow-sm transition hover:scale-[1.02] hover:shadow-md ${
                  isSelected ? "border-primary" : ""
                }`}
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

                <div className="absolute left-2 top-2 z-20 rounded-md bg-white/95 text-black shadow">
                  <CCheckbox
                    checked={isSelected}
                    formControlLabelSx={{
                      margin: 0,
                    }}
                    sx={{
                      margin: 0,
                      padding: 0,
                    }}
                    onClick={(event) => event.stopPropagation()}
                    onChange={() => toggleLocation(location.id)}
                  />
                </div>

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
      <Divider />
      <div className="flex w-full items-center justify-center pt-2">
        <div className="w-fit">
          <CButton
            loading={exporting}
            onClick={() => {
              void handleExport();
            }}
            enableTopLeftChip
            topLeftChipLabel={
              selectedLocationIds.size > 0 ?
                selectedLocationIds.size
              : undefined
            }
          >
            <IconTableExport /> Exportar dados cadastrais
          </CButton>
        </div>
      </div>
    </div>
  );
};

export default ExportSidebar;
