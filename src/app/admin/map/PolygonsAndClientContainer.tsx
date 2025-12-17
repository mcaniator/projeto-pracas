"use client";

import LocationDetails from "@/app/admin/map/locationDetails/locationDetails";
import { MapContext } from "@/app/admin/map/mapProvider";
import { _fetchCities } from "@/lib/serverFunctions/apiCalls/city";
import { useFetchLocations } from "@/lib/serverFunctions/apiCalls/location";
import { FetchCitiesResponse } from "@/lib/serverFunctions/queries/city";
import { CircularProgress } from "@mui/material";
import { BrazilianStates } from "@prisma/client";
import { IconLocationPin, IconPlus } from "@tabler/icons-react";
import { useCallback, useContext, useEffect, useState } from "react";

import PermissionGuard from "../../../components/auth/permissionGuard";
import CButton from "../../../components/ui/cButton";
import { FetchLocationsResponse } from "../../../lib/serverFunctions/queries/location";
import PolygonProvider from "./polygonProvider";
import RegisterMenu from "./register/registerMenu";
import Sidebar from "./sidebar/sidebar";

const PolygonsAndClientContainer = () => {
  const map = useContext(MapContext);
  const view = map?.getView();
  //const locationsWithPolygon = use(locationsWithPolygonPromise);
  const [locationsWithPolygon, setLocationsWithPolygon] = useState<
    FetchLocationsResponse["locations"]
  >([]);

  const [selectedLocation, setSelectedLocation] = useState<
    FetchLocationsResponse["locations"][number] | null
  >(null);

  const [citiesOptions, setCitiesOptions] = useState<
    FetchCitiesResponse["cities"] | null
  >(null);

  const [isCreating, setIsCreating] = useState(false);
  const [state, setState] = useState<BrazilianStates>("MG");
  const [cityId, setCityId] = useState<number | null>(null);

  const [fetchLocationsAPI, loadingLocations] = useFetchLocations({
    cityId: cityId ?? -1,
  });

  const fetchLocations = useCallback(async () => {
    const locationsResponse = await fetchLocationsAPI();
    setLocationsWithPolygon(locationsResponse.data?.locations ?? []);
  }, [fetchLocationsAPI]);

  const loadCitiesOptions = async () => {
    const citiesResponse = await _fetchCities({
      state: state,
      includeAdminstrativeRegions: true,
    });
    setCitiesOptions(citiesResponse.data?.cities ?? []);
    const initialCityId = citiesResponse.data?.cities[0]?.id ?? null;
    setCityId(initialCityId);
  };

  useEffect(() => {
    void loadCitiesOptions();
  }, [state]);

  useEffect(() => {
    void fetchLocations();
  }, [fetchLocations, cityId]);

  const selectLocation = (locationId: number | null) => {
    if (locationId === null || locationId === selectedLocation?.id) {
      setSelectedLocation(null);
      return;
    }
    const location =
      locationsWithPolygon.find((loc) => loc.id === locationId) || null;
    if (!location) return;
    setSelectedLocation(location);
  };

  return (
    <PolygonProvider
      fullLocations={locationsWithPolygon}
      handleSelectLocation={selectLocation}
      selectedLocation={selectedLocation}
    >
      <div
        className={`absolute bottom-0 top-0 z-50 flex max-h-full w-fit overflow-auto pr-4 transition-all duration-300 ease-in-out ${!isCreating ? "translate-x-0" : `pointer-events-none -translate-x-full`} `}
      >
        <div className="flex max-h-full w-fit justify-between overflow-auto p-4">
          <Sidebar
            loadingLocations={loadingLocations}
            locations={locationsWithPolygon}
            citiesOptions={citiesOptions}
            cityId={cityId}
            setCityId={setCityId}
            setState={setState}
            selectLocation={selectLocation}
            state={state}
          />
        </div>
        {selectedLocation && (
          <div className="flex max-h-full w-fit justify-between overflow-auto py-4">
            <LocationDetails
              location={selectedLocation}
              closeLocationDetails={() => {
                setSelectedLocation(null);
              }}
              reloadLocations={() => {
                void fetchLocations();
              }}
            />
          </div>
        )}
      </div>
      <div className="absolute right-56 top-4 z-50 h-fit w-fit pr-4">
        <CButton
          square
          tooltip="Centralizar no seu local"
          onClick={() => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                view?.animate({
                  center: [pos.coords.longitude, pos.coords.latitude],
                  zoom: 17,
                  duration: 1000,
                });
              },
              null,
              {
                enableHighAccuracy: false,
                maximumAge: Infinity,
                timeout: 60000,
              },
            );
          }}
        >
          <IconLocationPin />
        </CButton>
      </div>
      {loadingLocations && (
        <div className="absolute bottom-4 right-4 z-50 h-fit w-fit pr-4">
          <CircularProgress color="secondary" size={64} />
        </div>
      )}

      <PermissionGuard requiresAnyRoles={["PARK_MANAGER"]}>
        {!isCreating && (
          <div className="absolute bottom-4 right-4 top-4 z-50 h-fit w-fit overflow-auto pr-4">
            <div>
              <CButton
                onClick={() => {
                  setIsCreating((prev) => !prev);
                }}
              >
                <IconPlus /> Cadastrar praça
              </CButton>
            </div>
          </div>
        )}
      </PermissionGuard>
      <PermissionGuard requiresAnyRoles={["PARK_MANAGER"]}>
        <div
          className={`absolute bottom-0 right-0 top-0 z-50 h-fit max-h-full w-fit overflow-auto transition-all duration-300 ease-in-out ${isCreating ? "translate-x-0" : `pointer-events-none translate-x-full`} `}
        >
          <div className="flex max-h-full w-fit justify-between overflow-auto p-4">
            <RegisterMenu
              close={() => {
                setIsCreating(false);
              }}
              reloadLocations={() => {
                void fetchLocations();
              }}
            />
          </div>
        </div>
      </PermissionGuard>
    </PolygonProvider>
  );
};

export default PolygonsAndClientContainer;
