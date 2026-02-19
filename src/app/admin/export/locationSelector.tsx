import { SelectedLocationObj } from "@/app/admin/export/client";
import { LocationsMapClientFilter } from "@/app/admin/map/PolygonsAndClientContainer";
import CAccordion from "@/components/ui/accordion/CAccordion";
import CAccordionDetails from "@/components/ui/accordion/CAccordionDetails";
import CAccordionSummary from "@/components/ui/accordion/CAccordionSummary";
import CAutocomplete from "@/components/ui/cAutoComplete";
import CButton from "@/components/ui/cButton";
import CIconChip from "@/components/ui/cIconChip";
import CTextField from "@/components/ui/cTextField";
import CLocationAdministrativeUnits from "@/components/ui/location/cLocationAdministrativeUnits";
import { useFetchCities } from "@/lib/serverFunctions/apiCalls/city";
import { useFetchLocations } from "@/lib/serverFunctions/apiCalls/location";
import { FetchCitiesResponse } from "@/lib/serverFunctions/queries/city";
import { FetchLocationsResponse } from "@/lib/serverFunctions/queries/location";
import { Chip, Divider, LinearProgress } from "@mui/material";
import { BrazilianStates } from "@prisma/client";
import {
  IconFilter,
  IconMapPin,
  IconPlus,
  IconTree,
} from "@tabler/icons-react";
import Fuse from "fuse.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Virtuoso } from "react-virtuoso";

const LocationSelector = ({
  selectedLocations,
  onSelecion,
}: {
  selectedLocations: SelectedLocationObj[];
  onSelecion: (location: FetchLocationsResponse["locations"][number]) => void;
}) => {
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
      if (selectedLocations.some((l) => l.id === location.id)) return;
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

    if (filter.name) {
      const resultFilteredByName = fuseHaystack.search(filter.name);
      setFilteredLocations(resultFilteredByName.map((result) => result.item));
    } else {
      setFilteredLocations(result);
    }
  }, [filter, locations, selectedLocations]);

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

  const numberOfActiveFilters = useMemo(() => {
    let count = 0;
    if (filter.broadAdministrativeUnitId) count++;
    if (filter.intermediateAdministrativeUnitId) count++;
    if (filter.narrowAdministrativeUnitId) count++;
    return count;
  }, [filter]);
  const AccordionFilter = (
    <>
      {selectedCity?.broadAdministrativeUnitTitle && (
        <CAutocomplete
          label={selectedCity.broadAdministrativeUnitTitle}
          options={broadUnits}
          getOptionLabel={(o) => o.name}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          loading={loadingCities}
          value={
            broadUnits.find((b) => b.id === filter.broadAdministrativeUnitId) ??
            null
          }
          onChange={(_, v) => {
            setFilter({
              ...filter,
              broadAdministrativeUnitId: v?.id ?? null,
            });
          }}
        />
      )}
      {selectedCity?.intermediateAdministrativeUnitTitle && (
        <CAutocomplete
          label={selectedCity.intermediateAdministrativeUnitTitle}
          options={intermediateUnits}
          getOptionLabel={(o) => o.name}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          loading={loadingCities}
          value={
            intermediateUnits.find(
              (b) => b.id === filter.intermediateAdministrativeUnitId,
            ) ?? null
          }
          onChange={(_, v) => {
            setFilter({
              ...filter,
              intermediateAdministrativeUnitId: v?.id ?? null,
            });
          }}
        />
      )}
      {selectedCity?.narrowAdministrativeUnitTitle && (
        <CAutocomplete
          label={selectedCity.narrowAdministrativeUnitTitle}
          options={narrowUnits}
          getOptionLabel={(o) => o.name}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          loading={loadingCities}
          value={
            narrowUnits.find(
              (b) => b.id === filter.narrowAdministrativeUnitId,
            ) ?? null
          }
          onChange={(_, v) => {
            setFilter({
              ...filter,
              narrowAdministrativeUnitId: v?.id ?? null,
            });
          }}
        />
      )}

      <CTextField
        label="Nome"
        value={filter.name}
        debounce={800}
        onChange={(e) => {
          setFilter({ ...filter, name: e.target.value });
        }}
      />
    </>
  );
  return (
    <>
      <div className="flex gap-1">
        <CAutocomplete
          className="w-32"
          label="Estado"
          disableClearable
          options={Object.values(BrazilianStates)}
          value={state}
          onChange={(_, v) => {
            setFilter({
              broadAdministrativeUnitId: null,
              intermediateAdministrativeUnitId: null,
              narrowAdministrativeUnitId: null,
              categoryId: null,
              typeId: null,
              name: null,
            });
            setState(v);
          }}
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
              narrowAdministrativeUnitTitle: null,
              intermediateAdministrativeUnitTitle: null,
              broadAdministrativeUnitTitle: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          }
          disableClearable
          options={citiesOptions ?? []}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          getOptionLabel={(o) => o.name}
          onChange={(_, v) => {
            setSelectedCity(v);
            setFilter({
              broadAdministrativeUnitId: null,
              intermediateAdministrativeUnitId: null,
              narrowAdministrativeUnitId: null,
              categoryId: null,
              typeId: null,
              name: null,
            });
          }}
        />
      </div>

      <CAccordion>
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
        <CAccordionDetails>{AccordionFilter}</CAccordionDetails>
      </CAccordion>

      {loadingLocations && (
        <div className="flex w-full flex-col justify-center text-lg">
          <LinearProgress />
          Carregando praças...
        </div>
      )}
      <Virtuoso
        data={filteredLocations}
        components={{
          EmptyPlaceholder: () => <div>Nenhuma praça encontrada!</div>,
        }}
        itemContent={(_, l) => (
          <div className="pb-4">
            <div
              key={l.id}
              className="flex flex-row justify-between bg-gray-200 p-2 px-2 shadow-xl"
            >
              <div className="flex h-auto w-full flex-col gap-1">
                <span className="flex flex-wrap items-center break-all text-lg font-semibold sm:text-2xl">
                  <CIconChip icon={<IconTree />} tooltip="Praça" />
                  {`${l.name}`}
                </span>
                <Divider />
                <div className="flex items-center">
                  <CIconChip tooltip="Cidade - Estado" icon={<IconMapPin />} />
                  {`${l.cityName} - ${l.state}`}
                </div>
                <Divider />
                <CLocationAdministrativeUnits location={l} />
                <Divider />
                <div className="flex items-center">
                  <span>{`Avaliações: ${l.assessmentCount},  Contagens: ${l.tallyCount}`}</span>
                </div>
              </div>
              <CButton variant="text" onClick={() => onSelecion(l)}>
                <IconPlus />
              </CButton>
            </div>
          </div>
        )}
      />
    </>
  );
};

export default LocationSelector;
