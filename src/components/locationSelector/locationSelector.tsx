import { LocationsMapClientFilter } from "@/app/admin/map/PolygonsAndClientContainer";
import CAutocomplete from "@/components/ui/cAutoComplete";
import { useFetchCities } from "@/lib/serverFunctions/apiCalls/city";
import { useFetchLocations } from "@/lib/serverFunctions/apiCalls/location";
import { FetchCitiesResponse } from "@/lib/serverFunctions/queries/city";
import { FetchLocationsResponse } from "@/lib/serverFunctions/queries/location";
import { BrazilianStates } from "@prisma/client";
import Fuse from "fuse.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const LocationSelector = ({
  selectedLocation,
  selectedLocationId,
  defaultLocationId,
  onSelectedLocationChange,
  onSelectedCityChange,
  onSelectedBroadUnitChange,
  onSelectedIntermediateUnitChange,
  onSelectedNarrowUnitChange,
}: {
  selectedLocation?: FetchLocationsResponse["locations"][number] | null;
  selectedLocationId?: number | null;
  defaultLocationId?: number | null;
  onSelectedLocationChange: (
    location: FetchLocationsResponse["locations"][number] | null,
  ) => void;
  onSelectedCityChange?: (
    city: FetchCitiesResponse["cities"][number] | null,
  ) => void;
  onSelectedBroadUnitChange?: (params: { broadUnitId: number } | null) => void;
  onSelectedIntermediateUnitChange?: (
    params: { intermediateUnitId: number } | null,
  ) => void;
  onSelectedNarrowUnitChange?: (
    params: { narrowUnitId: number } | null,
  ) => void;
}) => {
  const hasMadeFirstChange = useRef(false);
  const [hasLoadedDefaultLocation, setHasLoadedDefaultLocation] =
    useState(false);
  const [state, setState] = useState<BrazilianStates>("MG");

  const [selectedCity, setSelectedCity] = useState<
    FetchCitiesResponse["cities"][number] | null
  >(null);

  const [locations, setLocations] = useState<
    FetchLocationsResponse["locations"]
  >([]);

  const [filteredLocations, setFilteredLocations] = useState<
    FetchLocationsResponse["locations"]
  >([]);

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

  const [_fetchDefaultLocation, loadingDefaultLocation] = useFetchLocations({
    callbacks: {
      onSuccess: (response) => {
        const defaultLocation = response.data?.locations[0] ?? null;
        if (defaultLocation) {
          setState(defaultLocation.state);
          setFilter({
            broadAdministrativeUnitId:
              defaultLocation.broadAdministrativeUnitId,
            intermediateAdministrativeUnitId:
              defaultLocation.intermediateAdministrativeUnitId,
            narrowAdministrativeUnitId:
              defaultLocation.narrowAdministrativeUnitId,
            categoryId: defaultLocation.categoryId,
            typeId: defaultLocation.typeId,
            name: null,
          });
          onSelectedLocationChange(defaultLocation);
          setHasLoadedDefaultLocation(true);
        }
      },
    },
  });

  const [_fetchLocations, loadingLocations] = useFetchLocations({
    callbacks: {
      onSuccess: (response) => {
        setLocations(response.data?.locations ?? []);
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

  const applyFilter = useCallback(() => {
    const result: FetchLocationsResponse["locations"] = [];
    locations.forEach((location) => {
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
    if (
      !defaultLocationId ||
      (defaultLocationId && hasMadeFirstChange.current)
    ) {
      onSelectedLocationChange(null);
    }

    if (filter.name) {
      const resultFilteredByName = fuseHaystack.search(filter.name);
      setFilteredLocations(resultFilteredByName.map((result) => result.item));
    } else {
      setFilteredLocations(result);
    }
  }, [filter, locations]);

  const loadDefaultLocation = useCallback(async () => {
    if (!defaultLocationId || hasLoadedDefaultLocation) return;
    await _fetchDefaultLocation({
      locationId: defaultLocationId,
    });
  }, []);

  const loadLocations = useCallback(async () => {
    if (!selectedCity) {
      setLocations([]);
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
    void loadDefaultLocation();
  }, [loadDefaultLocation]);

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

  const calculatatedSelectedLocation = useMemo(() => {
    return (
      selectedLocation ??
      filteredLocations.find((l) => l.id === selectedLocationId) ??
      null
    );
  }, [filteredLocations, selectedLocation, selectedLocationId]);

  return (
    <>
      <div className="flex gap-1">
        <CAutocomplete
          className="w-32"
          label="Estado"
          disableClearable
          loading={loadingDefaultLocation}
          options={Object.values(BrazilianStates)}
          value={state}
          onChange={(_, v) => setState(v)}
        />
        <CAutocomplete
          className="w-full"
          label="Cidade"
          loading={loadingCities || loadingDefaultLocation}
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
          onChange={(_, v) => {
            hasMadeFirstChange.current = true;
            setSelectedCity(v);
            onSelectedCityChange?.(v ?? null);
          }}
        />
      </div>
      <CAutocomplete
        label="Região administrativa ampla"
        options={broadUnits}
        getOptionLabel={(o) => o.name}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        loading={loadingCities || loadingDefaultLocation}
        value={
          broadUnits.find((b) => b.id === filter.broadAdministrativeUnitId) ??
          null
        }
        onChange={(_, v) => {
          hasMadeFirstChange.current = true;
          setFilter({
            ...filter,
            broadAdministrativeUnitId: v?.id ?? null,
          });
          onSelectedBroadUnitChange?.(v ? { broadUnitId: v.id } : null);
        }}
      />
      <CAutocomplete
        label="Região administrativa intermendiária"
        options={intermediateUnits}
        getOptionLabel={(o) => o.name}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        loading={loadingCities || loadingDefaultLocation}
        value={
          intermediateUnits.find(
            (b) => b.id === filter.intermediateAdministrativeUnitId,
          ) ?? null
        }
        onChange={(_, v) => {
          hasMadeFirstChange.current = true;
          setFilter({
            ...filter,
            intermediateAdministrativeUnitId: v?.id ?? null,
          });
          onSelectedIntermediateUnitChange?.(
            v ? { intermediateUnitId: v.id } : null,
          );
        }}
      />
      <CAutocomplete
        label="Região administrativa estreita"
        options={narrowUnits}
        getOptionLabel={(o) => o.name}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        loading={loadingCities || loadingDefaultLocation}
        value={
          narrowUnits.find((b) => b.id === filter.narrowAdministrativeUnitId) ??
          null
        }
        onChange={(_, v) => {
          hasMadeFirstChange.current = true;
          setFilter({
            ...filter,
            narrowAdministrativeUnitId: v?.id ?? null,
          });
          onSelectedNarrowUnitChange?.(v ? { narrowUnitId: v.id } : null);
        }}
      />
      <CAutocomplete
        label="Praça"
        loading={loadingLocations || loadingDefaultLocation}
        options={filteredLocations}
        getOptionLabel={(o) => o.name}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        value={calculatatedSelectedLocation}
        onChange={(_, v) => {
          hasMadeFirstChange.current = true;
          onSelectedLocationChange(v);
        }}
      />
    </>
  );
};

export default LocationSelector;
