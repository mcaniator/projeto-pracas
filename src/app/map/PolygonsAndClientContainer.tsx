"use client";

import CButton from "@/components/ui/cButton";
import { usePublicFetchCities } from "@/lib/serverFunctions/apiCalls/city";
import { usePublicFetchLocations } from "@/lib/serverFunctions/apiCalls/public/location";
import useCenterOnUserLocation from "@/lib/hooks/useCenterOnUserLocation";
import { FetchCitiesResponse } from "@/lib/serverFunctions/queries/city";
import { PublicFetchLocationsResponse } from "@/lib/serverFunctions/queries/public/location";
import {
  LAST_SELECTED_LOCATION_KEY,
  getStoredLocationSelection,
} from "@/lib/utils/localStorage";
import { Chip, CircularProgress } from "@mui/material";
import { BrazilianStates } from "@prisma/client";
import {
  IconAlertTriangle,
  IconLocationPin,
  IconZoomIn,
  IconZoomOut,
} from "@tabler/icons-react";
import Fuse from "fuse.js";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import LocationDetails from "./locationDetails/locationDetails";
import { MapContext } from "./mapProvider";
import PolygonProvider from "./polygonProvider";
import Sidebar from "./sidebar/sidebar";

export type LocationsMapClientFilter = {
  broadAdministrativeUnitId: number | null;
  intermediateAdministrativeUnitId: number | null;
  narrowAdministrativeUnitId: number | null;
  categoryId: number | null;
  typeId: number | null;
  name: string | null;
};

const PolygonsAndClientContainer = () => {
  const map = useContext(MapContext);
  const view = map?.getView();
  const centerOnUserLocation = useCenterOnUserLocation();
  //const locationsWithPolygon = use(locationsWithPolygonPromise);
  const [locationsWithPolygon, setLocationsWithPolygon] = useState<
    PublicFetchLocationsResponse["locations"]
  >([]);

  const [filteredLocationsWithPolygon, setFilteredLocationsWithPolygon] =
    useState<PublicFetchLocationsResponse["locations"]>([]);

  const [selectedLocation, setSelectedLocation] = useState<
    PublicFetchLocationsResponse["locations"][number] | null
  >(null);

  const [citiesOptions, setCitiesOptions] = useState<
    FetchCitiesResponse["cities"] | null
  >(null);

  const [filter, setFilter] = useState<LocationsMapClientFilter>({
    broadAdministrativeUnitId: null,
    intermediateAdministrativeUnitId: null,
    narrowAdministrativeUnitId: null,
    categoryId: null,
    typeId: null,
    name: null,
  });

  const [
    disableAutoFitAfterLocationsLoad,
    setDisableAutoFitAfterLocationsLoad,
  ] = useState(false);

  const numberOfActiveFilters = useMemo(() => {
    let count = 0;
    if (filter.broadAdministrativeUnitId !== null) count++;
    if (filter.intermediateAdministrativeUnitId !== null) count++;
    if (filter.narrowAdministrativeUnitId !== null) count++;
    if (filter.categoryId !== null) count++;
    if (filter.typeId !== null) count++;
    return count;
  }, [filter]);

  const [state, setState] = useState<BrazilianStates>(
    () => getStoredLocationSelection()?.state ?? "MG",
  );
  const [selectedCity, setSelectedCity] = useState<
    FetchCitiesResponse["cities"][number] | null
  >(null);

  const [sidebarDialogOpen, setSidebarDialogOpen] = useState(false);

  const [_fetchLocations, loadingLocations] = usePublicFetchLocations({
    callbacks: {
      onSuccess: (response) => {
        setLocationsWithPolygon(response.data?.locations ?? []);
      },
    },
  });
  const [_fetchCities, loadingCities] = usePublicFetchCities({
    callbacks: {
      onSuccess: (response) => {
        setCitiesOptions(response.data?.cities ?? []);
        const lastSelection = getStoredLocationSelection();
        const lastSelectedCityId = lastSelection?.cityId;
        let initialCity: FetchCitiesResponse["cities"][number] | null = null;
        if (lastSelectedCityId !== null && lastSelectedCityId !== undefined) {
          initialCity =
            response.data?.cities.find(
              (city) => city.id === lastSelectedCityId,
            ) ?? null;
          if (!initialCity) {
            initialCity = response.data?.cities[0] ?? null;
          }
        } else {
          initialCity = response.data?.cities[0] ?? null;
        }
        setSelectedCity(initialCity);
      },
    },
  });

  const applyFilter = useCallback(() => {
    const result: PublicFetchLocationsResponse["locations"] = [];
    locationsWithPolygon.forEach((location) => {
      if (
        filter.broadAdministrativeUnitId &&
        location.broadAdministrativeUnitId !== filter.broadAdministrativeUnitId
      ) {
        if (filter.broadAdministrativeUnitId !== -1) return;
        if (location.broadAdministrativeUnitId !== null) return;
      }

      if (
        filter.intermediateAdministrativeUnitId &&
        location.intermediateAdministrativeUnitId !==
          filter.intermediateAdministrativeUnitId
      ) {
        if (filter.intermediateAdministrativeUnitId !== -1) return;
        if (location.intermediateAdministrativeUnitId !== null) return;
      }
      if (
        filter.narrowAdministrativeUnitId &&
        location.narrowAdministrativeUnitId !==
          filter.narrowAdministrativeUnitId
      ) {
        if (filter.narrowAdministrativeUnitId !== -1) return;
        if (location.narrowAdministrativeUnitId !== null) return;
      }

      if (filter.categoryId && location.categoryId !== filter.categoryId) {
        if (filter.categoryId !== -1) return;
        if (location.categoryId !== null) return;
      }

      if (filter.typeId && location.typeId !== filter.typeId) {
        if (filter.typeId !== -1) return;
        if (location.typeId !== null) return;
      }

      result.push(location);
    });

    const fuseHaystack = new Fuse(result, {
      keys: ["name", "popularName"],
    });

    setSelectedLocation(null);

    if (filter.name) {
      const resultFilteredByName = fuseHaystack.search(filter.name);
      setFilteredLocationsWithPolygon(
        resultFilteredByName.map((result) => result.item),
      );
    } else {
      setFilteredLocationsWithPolygon(result);
    }

    setTimeout(() => setDisableAutoFitAfterLocationsLoad(false), 500);
  }, [filter, locationsWithPolygon]);

  const loadLocations = useCallback(
    async ({
      invalidateCache,
    }: {
      invalidateCache?: boolean;
    } = {}) => {
      if (!selectedCity) {
        setLocationsWithPolygon([]);
        return;
      }
      await _fetchLocations(
        {
          cityId: selectedCity?.id,
        },
        {
          cache: invalidateCache ? "reload" : "default",
        },
      );
    },
    [_fetchLocations, selectedCity],
  );

  const loadCitiesOptions = useCallback(
    async ({ invalidateCache }: { invalidateCache?: boolean } = {}) => {
      await _fetchCities(
        {
          state: state,
          includeAdminstrativeRegions: true,
        },
        {
          cache: invalidateCache ? "reload" : "default",
        },
      );
    },
    [state, _fetchCities],
  );

  useEffect(() => {
    void loadCitiesOptions();
  }, [loadCitiesOptions]);

  useEffect(() => {
    void loadLocations();
  }, [loadLocations]);

  useEffect(() => {
    applyFilter();
  }, [applyFilter]);

  useEffect(() => {
    if (!selectedCity || selectedCity.state !== state) return;
    localStorage.setItem(
      LAST_SELECTED_LOCATION_KEY,
      JSON.stringify({
        state,
        cityId: selectedCity?.id ?? null,
      }),
    );
  }, [state, selectedCity]);

  const selectLocation = (locationId: number | null) => {
    if (locationId === null || locationId === selectedLocation?.id) {
      setSelectedLocation(null);
      return;
    }
    const location =
      filteredLocationsWithPolygon.find((loc) => loc.id === locationId) || null;
    if (!location) return;
    setSelectedLocation(location);
  };

  //Detecção de largura da tela
  const [isMobileView, setIsMobileView] = useState<boolean>(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1055);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <PolygonProvider
      fullLocations={filteredLocationsWithPolygon}
      handleSelectLocation={selectLocation}
      selectedLocation={selectedLocation}
      disableAutoFitAfterLocationsLoad={disableAutoFitAfterLocationsLoad}
      isMobileView={isMobileView}
    >
      <div
        className={`pointer-events-none absolute bottom-0 top-0 z-50 flex max-h-full w-full overflow-auto transition-all duration-300 ease-in-out`}
      >
        <div
          className={`flex max-h-full shrink-0 justify-between overflow-auto ${isMobileView ? "h-fit w-full p-3" : "h-full w-fit p-4"}`}
        >
          <Sidebar
            loadingLocations={loadingLocations}
            loadingCities={loadingCities}
            locations={filteredLocationsWithPolygon}
            citiesOptions={citiesOptions}
            selectedCity={selectedCity}
            selectedLocationId={selectedLocation?.id ?? null}
            setCity={setSelectedCity}
            setState={setState}
            selectLocation={selectLocation}
            state={state}
            filter={filter}
            isMobileView={isMobileView}
            numberOfActiveFilters={numberOfActiveFilters}
            setFilter={setFilter}
            sidebarDialogOpen={sidebarDialogOpen}
            setSidebarDialogOpen={setSidebarDialogOpen}
          />
        </div>
        {selectedLocation && (
          <div className="flex max-h-full w-full py-4">
            <div className="pointer-events-auto h-full shrink-0">
              <LocationDetails
                location={selectedLocation}
                isMobileView={isMobileView}
                closeLocationDetails={() => {
                  setSelectedLocation(null);
                }}
              />
            </div>

            {!selectedLocation.st_asgeojson && (
              <div className="ml-1 flex flex-1 items-center justify-center">
                <Chip
                  icon={<IconAlertTriangle />}
                  label="Praça sem demarcação registrada!"
                  color="error"
                />
              </div>
            )}
          </div>
        )}
      </div>
      {(!!loadingLocations || !!loadingCities) && (
        <div
          className={`absolute z-50 h-fit w-fit ${isMobileView ? "bottom-12 left-4" : "bottom-0 right-12"}`}
        >
          <CircularProgress color="secondary" size={64} />
        </div>
      )}
      {
        <div
          className={`pointer-events-auto absolute bottom-2 right-2 z-50 flex h-fit w-fit flex-col gap-2 overflow-auto`}
        >
          <CButton
            square
            onClick={() => {
              const zoom = view?.getZoom();

              view?.animate({
                zoom: zoom !== undefined ? zoom + 1 : 0,
                duration: 50,
              });
            }}
          >
            <IconZoomIn />
          </CButton>
          <CButton
            square
            onClick={() => {
              const zoom = view?.getZoom();

              view?.animate({
                zoom: zoom !== undefined ? zoom - 1 : 0,
                duration: 50,
              });
            }}
          >
            <IconZoomOut />
          </CButton>
        </div>
      }

      <div
        className={`pointer-events-auto absolute z-50 flex h-fit w-fit flex-row gap-2 overflow-auto ${isMobileView ? "bottom-2 left-2" : "right-2 top-4"}`}
      >
        <CButton
          square
          tooltip="Centralizar na sua localização"
          onClick={() => {
            void centerOnUserLocation({
              view,
              zoom: 17,
              duration: 1000,
              maximumAge: 0,
              useCachedLocationImmediately: true,
            });
          }}
        >
          <IconLocationPin />
        </CButton>
      </div>
    </PolygonProvider>
  );
};

export default PolygonsAndClientContainer;
