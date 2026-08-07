"use client";

import CAutocomplete from "@/components/ui/cAutoComplete";
import { useFetchCities } from "@/lib/serverFunctions/apiCalls/city";
import type { FetchCitiesParams } from "@/lib/serverFunctions/queries/city";
import type { FetchCitiesResponse } from "@/lib/serverFunctions/queries/city";
import { getStoredLocationSelection } from "@/lib/utils/localStorage";
import { BrazilianStates } from "@prisma/client";
import { useEffect, useMemo, useRef, useState } from "react";

export type CitySelectorCity = FetchCitiesResponse["cities"][number];

const CitySelector = ({
  selectedCity,
  onSelectedCityChange,
  fetchCitiesParams = {},
  disabled = false,
}: {
  selectedCity: CitySelectorCity | null;
  onSelectedCityChange: (city: CitySelectorCity | null) => void;
  fetchCitiesParams?: Omit<FetchCitiesParams, "state">;
  disabled?: boolean;
}) => {
  const storedLocationSelection = useRef(getStoredLocationSelection());
  const hasHadFirstChange = useRef(false);
  const [state, setState] = useState<BrazilianStates>(
    () => storedLocationSelection.current?.state ?? "MG",
  );
  const [cities, setCities] = useState<CitySelectorCity[] | null>(null);
  const [fetchCities, loadingCities] = useFetchCities({
    callbacks: {
      onSuccess(response) {
        setCities(response.data?.cities ?? []);
        const storedCityId = storedLocationSelection.current?.cityId;
        const storedState = storedLocationSelection.current?.state;
        if (
          !hasHadFirstChange.current &&
          storedCityId != null &&
          storedState != null &&
          storedState === state
        ) {
          onSelectedCityChange(
            response.data?.cities.find((city) => city.id === storedCityId) ??
              null,
          );
        } else {
          onSelectedCityChange(response.data?.cities[0] ?? null);
        }
      },
    },
  });

  const {
    noEmptyLocations,
    includeAdminstrativeRegions,
    includeUniqueAdminstrativeUnitsTitles,
  } = fetchCitiesParams;

  const queryParams = useMemo<FetchCitiesParams>(
    () => ({
      state,
      noEmptyLocations,
      includeAdminstrativeRegions,
      includeUniqueAdminstrativeUnitsTitles,
    }),
    [
      state,
      noEmptyLocations,
      includeAdminstrativeRegions,
      includeUniqueAdminstrativeUnitsTitles,
    ],
  );

  useEffect(() => {
    const loadCities = async () => {
      await fetchCities({
        params: queryParams,
        requestOptions: {
          cache: "reload",
        },
      });
    };

    void loadCities();
  }, [fetchCities, queryParams]);

  useEffect(() => {
    if (selectedCity && selectedCity.state !== state) {
      setState(selectedCity.state);
    }
  }, [selectedCity, state]);

  return (
    <div className="flex gap-1">
      <CAutocomplete
        className="w-32"
        label="Estado"
        options={Object.values(BrazilianStates)}
        value={state}
        disableClearable
        disabled={disabled}
        onChange={(_, nextState) => {
          setState(nextState);
          onSelectedCityChange(null);
        }}
      />
      <CAutocomplete
        className="w-full"
        label="Cidade"
        options={cities ?? []}
        value={selectedCity!}
        loading={loadingCities}
        disabled={disabled}
        disableClearable
        getOptionLabel={(city) => city.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onChange={(_, city) => {
          if (storedLocationSelection.current?.state === state) {
            hasHadFirstChange.current = true;
          }

          onSelectedCityChange(city);
        }}
      />
    </div>
  );
};

export default CitySelector;
