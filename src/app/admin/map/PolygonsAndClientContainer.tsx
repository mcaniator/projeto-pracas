"use client";

import LocationDetails from "@/app/admin/map/locationDetails/locationDetails";
import { MapContext } from "@/app/admin/map/mapProvider";
import { useHelperCard } from "@/components/context/helperCardContext";
import { useFetchCities } from "@/lib/serverFunctions/apiCalls/city";
import { useFetchLocations } from "@/lib/serverFunctions/apiCalls/location";
import { useFetchLocationCategories } from "@/lib/serverFunctions/apiCalls/locationCategory";
import { useFetchLocationTypes } from "@/lib/serverFunctions/apiCalls/locationType";
import { FetchCitiesResponse } from "@/lib/serverFunctions/queries/city";
import { FetchLocationCategoriesResponse } from "@/lib/serverFunctions/queries/locationCategory";
import { FetchLocationTypesResponse } from "@/lib/serverFunctions/queries/locationType";
import { CircularProgress } from "@mui/material";
import { BrazilianStates } from "@prisma/client";
import { IconLocationPin, IconPlus } from "@tabler/icons-react";
import Fuse from "fuse.js";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import PermissionGuard from "../../../components/auth/permissionGuard";
import CButton from "../../../components/ui/cButton";
import { FetchLocationsResponse } from "../../../lib/serverFunctions/queries/location";
import PolygonProvider from "./polygonProvider";
import RegisterMenu from "./register/registerMenu";
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
  const { setHelperCard } = useHelperCard();
  const map = useContext(MapContext);
  const view = map?.getView();
  //const locationsWithPolygon = use(locationsWithPolygonPromise);
  const [locationsWithPolygon, setLocationsWithPolygon] = useState<
    FetchLocationsResponse["locations"]
  >([]);

  const [filteredLocationsWithPolygon, setFilteredLocationsWithPolygon] =
    useState<FetchLocationsResponse["locations"]>([]);

  const [selectedLocation, setSelectedLocation] = useState<
    FetchLocationsResponse["locations"][number] | null
  >(null);

  const [citiesOptions, setCitiesOptions] = useState<
    FetchCitiesResponse["cities"] | null
  >(null);

  const [locationCategories, setLocationCategories] = useState<
    FetchLocationCategoriesResponse["categories"]
  >([]);

  const [locationTypes, setLocationTypes] = useState<
    FetchLocationTypesResponse["types"]
  >([]);

  const [filter, setFilter] = useState<LocationsMapClientFilter>({
    broadAdministrativeUnitId: null,
    intermediateAdministrativeUnitId: null,
    narrowAdministrativeUnitId: null,
    categoryId: null,
    typeId: null,
    name: null,
  });

  const numberOfActiveFilters = useMemo(() => {
    let count = 0;
    if (filter.broadAdministrativeUnitId !== null) count++;
    if (filter.intermediateAdministrativeUnitId !== null) count++;
    if (filter.narrowAdministrativeUnitId !== null) count++;
    if (filter.categoryId !== null) count++;
    if (filter.typeId !== null) count++;
    return count;
  }, [filter]);

  const [isCreating, setIsCreating] = useState(false);
  const [state, setState] = useState<BrazilianStates>("MG");
  const [selectedCity, setSelectedCity] = useState<
    FetchCitiesResponse["cities"][number] | null
  >(null);

  const [_fetchLocations, loadingLocations] = useFetchLocations();
  const [_fetchCities, loadingCities] = useFetchCities({
    callbacks: {
      onSuccess: (response) => {
        setCitiesOptions(response.data?.cities ?? []);
        const initialCity = response.data?.cities[0] ?? null;
        setSelectedCity(initialCity);
      },
    },
  });
  const [_fetchLocationCategories, loadingCategories] =
    useFetchLocationCategories({
      callbacks: {
        onSuccess: (response) =>
          setLocationCategories(response.data?.categories ?? []),
      },
    });
  const [_fetchLocationTypes, loadingTypes] = useFetchLocationTypes({
    callbacks: {
      onSuccess: (response) => setLocationTypes(response.data?.types ?? []),
    },
  });

  const applyFilter = useCallback(() => {
    const result: FetchLocationsResponse["locations"] = [];
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
  }, [filter, locationsWithPolygon]);
  const loadLocations = useCallback(async () => {
    const locationsResponse = await _fetchLocations({
      cityId: selectedCity?.id ?? -1,
    });
    setLocationsWithPolygon(locationsResponse.data?.locations ?? []);
  }, [_fetchLocations, selectedCity]);

  const loadCitiesOptions = useCallback(async () => {
    await _fetchCities({
      state: state,
      includeAdminstrativeRegions: true,
    });
  }, [state, _fetchCities]);

  const loadCategories = useCallback(async () => {
    await _fetchLocationCategories({});
  }, [_fetchLocationCategories]);

  const loadTypes = useCallback(async () => {
    await _fetchLocationTypes({});
  }, [_fetchLocationTypes]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    void loadTypes();
  }, [loadTypes]);

  useEffect(() => {
    void loadCitiesOptions();
  }, [loadCitiesOptions]);

  useEffect(() => {
    void loadLocations();
  }, [loadLocations]);

  useEffect(() => {
    applyFilter();
  }, [applyFilter]);

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
      setIsMobileView(window.innerWidth < 1000);
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
      isMobileView={isMobileView}
    >
      <div
        className={`pointer-events-none absolute bottom-0 top-0 z-50 flex max-h-full overflow-auto transition-all duration-300 ease-in-out ${!isCreating ? "translate-x-0" : `pointer-events-none -translate-x-full`} ${isMobileView ? "w-full" : "w-fit"}`}
      >
        <div
          className={`pointer-events-auto flex max-h-full justify-between overflow-auto ${isMobileView ? "h-fit w-full p-3" : "h-full w-fit p-4"}`}
        >
          <Sidebar
            loadingLocations={loadingLocations}
            loadingCities={loadingCities}
            loadingCategories={loadingCategories}
            loadingTypes={loadingTypes}
            locations={filteredLocationsWithPolygon}
            locationCategories={locationCategories}
            locationTypes={locationTypes}
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
          />
        </div>
        {selectedLocation && (
          <div className="pointer-events-auto flex max-h-full w-fit justify-between overflow-auto py-4">
            <LocationDetails
              location={selectedLocation}
              isMobileView={isMobileView}
              closeLocationDetails={() => {
                setSelectedLocation(null);
              }}
              reloadLocations={() => {
                void loadLocations();
              }}
            />
          </div>
        )}
      </div>
      {loadingLocations && (
        <div
          className={`absolute bottom-4 z-50 h-fit w-fit ${isMobileView ? "left-4" : "right-4"}`}
        >
          <CircularProgress color="secondary" size={64} />
        </div>
      )}

      {!isCreating && (
        <div
          className={`pointer-events-auto absolute right-2 z-50 flex h-fit w-fit flex-row gap-2 overflow-auto ${isMobileView ? "bottom-2" : "top-4"}`}
        >
          <PermissionGuard requiresAnyRoles={["PARK_MANAGER"]}>
            <div>
              <CButton
                square={isMobileView}
                onClick={() => {
                  setIsCreating((prev) => !prev);
                }}
              >
                <IconPlus /> {!isMobileView && "Cadastrar praça"}
              </CButton>
            </div>
          </PermissionGuard>
          <CButton
            square
            tooltip="Centralizar na sua localização"
            onClick={() => {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  view?.animate({
                    center: [pos.coords.longitude, pos.coords.latitude],
                    zoom: 17,
                    duration: 1000,
                  });
                },
                () => {
                  setHelperCard({
                    show: true,
                    helperCardType: "ERROR",
                    content: <>Erro ao obter sua localização!</>,
                  });
                },
                {
                  enableHighAccuracy: false,
                  maximumAge: 0,
                  timeout: 60000,
                },
              );
            }}
          >
            <IconLocationPin />
          </CButton>
        </div>
      )}
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
                void loadLocations();
              }}
              reloadLocationTypes={() => {
                void loadTypes();
              }}
              reloadLocationCategories={() => {
                void loadCategories();
              }}
              reloadCities={() => {
                void loadCitiesOptions();
              }}
            />
          </div>
        </div>
      </PermissionGuard>
    </PolygonProvider>
  );
};

export default PolygonsAndClientContainer;
