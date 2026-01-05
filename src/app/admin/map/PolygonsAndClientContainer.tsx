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
import { Chip, CircularProgress } from "@mui/material";
import { BrazilianStates } from "@prisma/client";
import {
  IconAlertTriangle,
  IconLocationPin,
  IconPlus,
  IconZoomIn,
  IconZoomOut,
} from "@tabler/icons-react";
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

  const [isEditingLocation, setIsEditingLocation] = useState(false);
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

  const [isCreating, setIsCreating] = useState(false);
  const [state, setState] = useState<BrazilianStates>("MG");
  const [selectedCity, setSelectedCity] = useState<
    FetchCitiesResponse["cities"][number] | null
  >(null);

  const [_fetchLocations, loadingLocations] = useFetchLocations({
    callbacks: {
      onSuccess: (response) => {
        setLocationsWithPolygon(response.data?.locations ?? []);
      },
    },
  });
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

    setTimeout(() => setDisableAutoFitAfterLocationsLoad(false), 500);
  }, [filter, locationsWithPolygon]);
  const loadLocations = useCallback(async () => {
    if (!selectedCity)
      if (!selectedCity) {
        setLocationsWithPolygon([]);
        return;
      }
    await _fetchLocations({
      cityId: selectedCity?.id,
    });
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
      disableAutoFitAfterLocationsLoad={disableAutoFitAfterLocationsLoad}
      isMobileView={isMobileView}
    >
      <div
        className={`pointer-events-none absolute bottom-0 top-0 z-50 flex max-h-full w-full overflow-auto transition-all duration-300 ease-in-out ${!isCreating && !isEditingLocation ? "translate-x-0" : `pointer-events-none -translate-x-full`}`}
      >
        <div
          className={`flex max-h-full shrink-0 justify-between overflow-auto ${isMobileView ? "h-fit w-full p-3" : "h-full w-fit p-4"}`}
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
          <div className="flex max-h-full w-full py-4">
            <div className="pointer-events-auto h-full shrink-0">
              <LocationDetails
                location={selectedLocation}
                isMobileView={isMobileView}
                closeLocationDetails={() => {
                  setSelectedLocation(null);
                }}
                enableLocationEdition={() => {
                  setIsEditingLocation(true);
                }}
                reloadLocations={() => {
                  void loadLocations();
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
      {loadingLocations && (
        <div
          className={`absolute bottom-4 z-50 h-fit w-fit ${isMobileView ? "left-4" : "right-4"}`}
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
      {!isCreating && !isEditingLocation && (
        <div
          className={`pointer-events-auto absolute z-50 flex h-fit w-fit flex-row gap-2 overflow-auto ${isMobileView ? "bottom-2 left-2" : "right-2 top-4"}`}
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
          className={`absolute bottom-0 right-0 top-0 z-50 h-fit max-h-full w-fit overflow-auto transition-all duration-300 ease-in-out ${isCreating || isEditingLocation ? "translate-x-0" : `pointer-events-none translate-x-full`} `}
        >
          <div className="flex max-h-full w-fit justify-between overflow-auto p-4">
            <RegisterMenu
              isEdition={isEditingLocation}
              locationToEdit={selectedLocation}
              close={() => {
                setIsCreating(false);
                setIsEditingLocation(false);
              }}
              reloadLocations={() => {
                setDisableAutoFitAfterLocationsLoad(true);
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
