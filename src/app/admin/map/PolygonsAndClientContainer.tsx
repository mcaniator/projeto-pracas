"use client";

import LocationDetails from "@/app/admin/map/locationDetails/locationDetails";
import { MapContext } from "@/app/admin/map/mapProvider";
import { useGeolocation } from "@/components/context/geolocationContext";
import useCenterOnUserLocation from "@/lib/hooks/useCenterOnUserLocation";
import { useFetchCities } from "@/lib/serverFunctions/apiCalls/city";
import { useFetchLocations } from "@/lib/serverFunctions/apiCalls/location";
import { useFetchLocationCategories } from "@/lib/serverFunctions/apiCalls/locationCategory";
import { useFetchLocationTypes } from "@/lib/serverFunctions/apiCalls/locationType";
import { useFetchMapAssessmentComparisonResults } from "@/lib/serverFunctions/apiCalls/mapAssessmentComparison";
import { FetchCitiesResponse } from "@/lib/serverFunctions/queries/city";
import { FetchLocationCategoriesResponse } from "@/lib/serverFunctions/queries/locationCategory";
import { FetchLocationTypesResponse } from "@/lib/serverFunctions/queries/locationType";
import {
  FetchMapAssessmentComparisonResultsResponse,
  MapAssessmentComparisonCategory,
} from "@/lib/serverFunctions/queries/mapAssessmentComparison";
import {
  LAST_SELECTED_LOCATION_KEY,
  getStoredLocationSelection,
} from "@/lib/utils/localStorage";
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
import MapSidebarShell, {
  SidebarMode,
  sidebarModes,
} from "./sidebar/mapSidebarShell";

export type LocationsMapClientFilter = {
  broadAdministrativeUnitId: number | null;
  intermediateAdministrativeUnitId: number | null;
  narrowAdministrativeUnitId: number | null;
  categoryId: number | null;
  typeId: number | null;
  name: string | null;
  onlyPublic: boolean;
};

const PolygonsAndClientContainer = () => {
  const map = useContext(MapContext);
  const view = map?.getView();
  const centerOnUserLocation = useCenterOnUserLocation();
  const { cachedUserCoordinates, isReadingUserLocation } = useGeolocation();
  const isUserLocationLoading = !cachedUserCoordinates && isReadingUserLocation;
  //const locationsWithPolygon = use(locationsWithPolygonPromise);
  const [
    locationsModeLocationsWithPolygon,
    setLocationsModeLocationsWithPolygon,
  ] = useState<FetchLocationsResponse["locations"]>([]);

  const [
    filteredLocationsModeLocationsWithPolygon,
    setFilteredLocationsModeLocationsWithPolygon,
  ] = useState<FetchLocationsResponse["locations"]>([]);
  const [
    assessmentsModeLocationsWithPolygon,
    setAssessmentsModeLocationsWithPolygon,
  ] = useState<FetchMapAssessmentComparisonResultsResponse["locations"]>([]);
  const [
    filteredAssessmentsModeLocationsWithPolygon,
    setFilteredAssessmentsModeLocationsWithPolygon,
  ] = useState<FetchMapAssessmentComparisonResultsResponse["locations"]>([]);

  const [selectedLocationsModeLocation, setSelectedLocationsModeLocation] =
    useState<FetchLocationsResponse["locations"][number] | null>(null);
  const [
    selectedAssessmentsModeLocationIds,
    setSelectedAssessmentsModeLocationIds,
  ] = useState<Set<number>>(() => new Set());
  const [selectedAssessmentsModeCategory, setSelectedAssessmentsModeCategory] =
    useState<MapAssessmentComparisonCategory | null>(null);
  const [
    loadingAssessmentsModeCategories,
    setLoadingAssessmentsModeCategories,
  ] = useState(false);

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
    onlyPublic: false,
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
    if (filter.onlyPublic) count++;
    return count;
  }, [filter]);

  const [isCreating, setIsCreating] = useState(false);
  const [state, setState] = useState<BrazilianStates>(
    () => getStoredLocationSelection()?.state ?? "MG",
  );
  const [selectedCity, setSelectedCity] = useState<
    FetchCitiesResponse["cities"][number] | null
  >(null);

  const [sidebarDialogOpen, setSidebarDialogOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>(
    sidebarModes.LOCATIONS,
  );

  const [_fetchLocationsModeLocations, loadingLocationsModeLocations] =
    useFetchLocations({
      callbacks: {
        onSuccess: (response) => {
          setLocationsModeLocationsWithPolygon(response.data?.locations ?? []);
        },
      },
    });
  const [_fetchCities, loadingCities] = useFetchCities({
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
  const [_fetchLocationCategories, loadingLocationCategories] =
    useFetchLocationCategories({
      callbacks: {
        onSuccess: (response) =>
          setLocationCategories(response.data?.categories ?? []),
      },
    });
  const [_fetchLocationTypes, loadingLocationTypes] = useFetchLocationTypes({
    callbacks: {
      onSuccess: (response) => setLocationTypes(response.data?.types ?? []),
    },
  });
  const [fetchAssessmentsModeLocations, loadingAssessmentsModeLocations] =
    useFetchMapAssessmentComparisonResults({
      callbacks: {
        onSuccess: (response) => {
          setAssessmentsModeLocationsWithPolygon(
            response.data?.locations ?? [],
          );
          setSelectedAssessmentsModeLocationIds(new Set());
        },
      },
    });

  const applyLocationsModeFilter = useCallback(() => {
    const result: FetchLocationsResponse["locations"] = [];
    locationsModeLocationsWithPolygon.forEach((location) => {
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
      if (filter.onlyPublic && !location.isPublic) return;

      result.push(location);
    });

    const fuseHaystack = new Fuse(result, {
      keys: ["name", "popularName"],
    });

    setSelectedLocationsModeLocation(null);

    if (filter.name) {
      const resultFilteredByName = fuseHaystack.search(filter.name);
      setFilteredLocationsModeLocationsWithPolygon(
        resultFilteredByName.map((result) => result.item),
      );
    } else {
      setFilteredLocationsModeLocationsWithPolygon(result);
    }

    setTimeout(() => setDisableAutoFitAfterLocationsLoad(false), 500);
  }, [filter, locationsModeLocationsWithPolygon]);

  const applyAssessmentsModeFilter = useCallback(() => {
    const result: FetchMapAssessmentComparisonResultsResponse["locations"] = [];
    assessmentsModeLocationsWithPolygon.forEach((location) => {
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
      if (filter.onlyPublic && !location.isPublic) return;

      result.push(location);
    });

    const fuseHaystack = new Fuse(result, {
      keys: ["name", "popularName"],
    });

    const filteredResult =
      filter.name ?
        fuseHaystack.search(filter.name).map((result) => result.item)
      : result;

    setFilteredAssessmentsModeLocationsWithPolygon(filteredResult);
  }, [assessmentsModeLocationsWithPolygon, filter]);

  const loadLocations = useCallback(
    async ({
      invalidateCache,
    }: {
      invalidateCache?: boolean;
    } = {}) => {
      if (sidebarMode !== sidebarModes.LOCATIONS) return;
      if (!selectedCity) {
        setLocationsModeLocationsWithPolygon([]);
        return;
      }
      await _fetchLocationsModeLocations(
        {
          cityId: selectedCity?.id,
        },
        {
          cache: invalidateCache ? "reload" : "default",
        },
      );
    },
    [_fetchLocationsModeLocations, selectedCity, sidebarMode],
  );

  const loadAssessmentsModeLocations = useCallback(async () => {
    if (sidebarMode !== sidebarModes.ASSESSMENTS) return;
    setAssessmentsModeLocationsWithPolygon([]);
    setSelectedAssessmentsModeLocationIds(new Set());
    if (!selectedCity || !selectedAssessmentsModeCategory) return;
    await fetchAssessmentsModeLocations({
      cityId: selectedCity.id,
      categoryId: selectedAssessmentsModeCategory.id,
    });
  }, [
    fetchAssessmentsModeLocations,
    selectedAssessmentsModeCategory,
    selectedCity,
    sidebarMode,
  ]);

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

  const loadCategories = useCallback(
    async ({ invalidateCache }: { invalidateCache?: boolean } = {}) => {
      await _fetchLocationCategories(
        {},
        {
          cache: invalidateCache ? "reload" : "default",
        },
      );
    },
    [_fetchLocationCategories],
  );

  const loadTypes = useCallback(
    async ({ invalidateCache }: { invalidateCache?: boolean } = {}) => {
      await _fetchLocationTypes(
        {},
        {
          cache: invalidateCache ? "reload" : "default",
        },
      );
    },
    [_fetchLocationTypes],
  );

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
    void loadAssessmentsModeLocations();
  }, [loadAssessmentsModeLocations]);

  useEffect(() => {
    applyLocationsModeFilter();
  }, [applyLocationsModeFilter]);

  useEffect(() => {
    applyAssessmentsModeFilter();
  }, [applyAssessmentsModeFilter]);

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
    if (
      locationId === null ||
      locationId === selectedLocationsModeLocation?.id
    ) {
      setSelectedLocationsModeLocation(null);
      return;
    }
    const location =
      filteredLocationsModeLocationsWithPolygon.find(
        (loc) => loc.id === locationId,
      ) || null;
    if (!location) return;
    setSelectedLocationsModeLocation(location);
  };

  const selectAssessmentLocation = (locationId: number | null) => {
    if (locationId === null) return;
    const location = filteredAssessmentsModeLocationsWithPolygon.find(
      (loc) => loc.id === locationId,
    );
    if (!location?.hasAssessmentsForSelectedCategory) return;
    setSelectedAssessmentsModeLocationIds((prev) => {
      const next = new Set(prev);
      if (next.has(locationId)) {
        next.delete(locationId);
      } else {
        next.add(locationId);
      }
      return next;
    });
  };

  const selectedAssessmentLocations = useMemo(() => {
    return filteredAssessmentsModeLocationsWithPolygon.filter(
      (location) =>
        selectedAssessmentsModeLocationIds.has(location.id) &&
        location.hasAssessmentsForSelectedCategory,
    );
  }, [
    filteredAssessmentsModeLocationsWithPolygon,
    selectedAssessmentsModeLocationIds,
  ]);

  const disabledAssessmentLocationIds = useMemo(() => {
    return filteredAssessmentsModeLocationsWithPolygon
      .filter((location) => !location.hasAssessmentsForSelectedCategory)
      .map((location) => location.id);
  }, [filteredAssessmentsModeLocationsWithPolygon]);

  const isLocationsMode = sidebarMode === sidebarModes.LOCATIONS;

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
      fullLocations={
        isLocationsMode ?
          filteredLocationsModeLocationsWithPolygon
        : filteredAssessmentsModeLocationsWithPolygon
      }
      handleSelectLocation={
        isLocationsMode ? selectLocation : selectAssessmentLocation
      }
      selectedLocation={isLocationsMode ? selectedLocationsModeLocation : null}
      selectedLocations={
        isLocationsMode ? undefined : selectedAssessmentLocations
      }
      disabledLocationIds={
        isLocationsMode ? undefined : disabledAssessmentLocationIds
      }
      disableAutoFitAfterLocationsLoad={disableAutoFitAfterLocationsLoad}
      isMobileView={isMobileView}
    >
      <div
        className={`pointer-events-none absolute bottom-0 top-0 z-50 flex max-h-full w-full overflow-auto transition-all duration-300 ease-in-out ${!isCreating && !isEditingLocation ? "translate-x-0" : `pointer-events-none -translate-x-full`}`}
      >
        <div
          className={`flex max-h-full shrink-0 justify-between overflow-auto ${isMobileView ? "h-fit w-full p-3" : "h-full w-fit p-4"}`}
        >
          <MapSidebarShell
            assessmentsSidebarProps={{
              citiesOptions,
              filter,
              loadingCities,
              loadingLocations: loadingAssessmentsModeLocations,
              locationCategories,
              locations: filteredAssessmentsModeLocationsWithPolygon,
              locationTypes,
              selectedCity,
              selectedCategory: selectedAssessmentsModeCategory,
              selectedLocationIds: selectedAssessmentsModeLocationIds,
              setCity: setSelectedCity,
              setFilter,
              setLoadingCategories: setLoadingAssessmentsModeCategories,
              setSelectedCategory: setSelectedAssessmentsModeCategory,
              setSelectedLocationIds: setSelectedAssessmentsModeLocationIds,
              setState,
              state,
            }}
            mode={sidebarMode}
            locationsSidebarProps={{
              loadingLocations: loadingLocationsModeLocations,
              loadingCities,
              loadingCategories: loadingLocationCategories,
              loadingTypes: loadingLocationTypes,
              locations: filteredLocationsModeLocationsWithPolygon,
              locationCategories,
              locationTypes,
              citiesOptions,
              selectedCity,
              selectedLocationId: selectedLocationsModeLocation?.id ?? null,
              setCity: setSelectedCity,
              setState,
              selectLocation,
              state,
              filter,
              isMobileView,
              numberOfActiveFilters,
              setFilter,
              sidebarDialogOpen,
              setSidebarDialogOpen,
            }}
            setMode={setSidebarMode}
          />
        </div>
        {isLocationsMode && selectedLocationsModeLocation && (
          <div className="flex max-h-full w-full py-4">
            <div className="pointer-events-auto h-full shrink-0">
              <LocationDetails
                location={selectedLocationsModeLocation}
                isMobileView={isMobileView}
                closeLocationDetails={() => {
                  if (isEditingLocation) {
                    return;
                  }
                  setSelectedLocationsModeLocation(null);
                }}
                enableLocationEdition={() => {
                  setIsEditingLocation(true);
                  setSidebarDialogOpen(false);
                }}
                reloadLocations={() => {
                  void loadLocations({ invalidateCache: true });
                }}
              />
            </div>

            {!selectedLocationsModeLocation.st_asgeojson && (
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
      {(!!loadingLocationsModeLocations ||
        !!loadingCities ||
        !!loadingAssessmentsModeLocations ||
        !!loadingAssessmentsModeCategories) && (
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
            loading={isUserLocationLoading}
            onClick={() => {
              void centerOnUserLocation({
                view,
                zoom: 17,
                duration: 500,
                maximumAge: 0,
                useCachedLocationImmediately: true,
              });
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
              locationToEdit={selectedLocationsModeLocation}
              close={() => {
                setIsCreating(false);
                setIsEditingLocation(false);
                setSelectedLocationsModeLocation(null);
              }}
              reloadLocations={() => {
                setDisableAutoFitAfterLocationsLoad(true);
                void loadLocations({ invalidateCache: true });
              }}
              reloadLocationTypes={() => {
                // We don't need to invalidate cache here, as location types have already been fetched and cached in the register dialog, if there were edits.
                void loadTypes();
              }}
              reloadLocationCategories={() => {
                // We don't need to invalidate cache here, as location categories have already been fetched and cached in the register dialog, if there were edits.
                void loadCategories();
              }}
              reloadCities={() => {
                // We need to invalidate cache here because the fetchCities function is called inside the register dialog with different params, thus the cache for this query needs to be invalidated.
                void loadCitiesOptions({ invalidateCache: true });
              }}
            />
          </div>
        </div>
      </PermissionGuard>
    </PolygonProvider>
  );
};

export default PolygonsAndClientContainer;
