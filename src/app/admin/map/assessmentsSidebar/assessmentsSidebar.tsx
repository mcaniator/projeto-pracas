"use client";

import CImage from "@/components/ui/CImage";
import CLinearProgress from "@/components/ui/CLinearProgress";
import CAccordion from "@/components/ui/accordion/CAccordion";
import CAccordionDetails from "@/components/ui/accordion/CAccordionDetails";
import CAccordionSummary from "@/components/ui/accordion/CAccordionSummary";
import CAutocomplete from "@/components/ui/cAutoComplete";
import CButton from "@/components/ui/cButton";
import CCheckbox from "@/components/ui/cCheckbox";
import CSwitch from "@/components/ui/cSwtich";
import CTextField from "@/components/ui/cTextField";
import {
  useFetchMapAssessmentComparisonCategories,
  useFetchMapAssessmentComparisonResults,
} from "@/lib/serverFunctions/apiCalls/mapAssessmentComparison";
import { FetchCitiesResponse } from "@/lib/serverFunctions/queries/city";
import { FetchLocationCategoriesResponse } from "@/lib/serverFunctions/queries/locationCategory";
import { FetchLocationTypesResponse } from "@/lib/serverFunctions/queries/locationType";
import {
  FetchMapAssessmentComparisonCategoriesResponse,
  FetchMapAssessmentComparisonResultsResponse,
  MapAssessmentComparisonLocation,
} from "@/lib/serverFunctions/queries/mapAssessmentComparison";
import { Chip, LinearProgress } from "@mui/material";
import { BrazilianStates } from "@prisma/client";
import {
  IconAlertTriangle,
  IconChartBar,
  IconFilter,
  IconTree,
} from "@tabler/icons-react";
import Fuse from "fuse.js";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Virtuoso } from "react-virtuoso";

import AssessmentComparisonDialog from "./assessmentComparisonDialog";

type AssessmentComparisonClientFilter = {
  broadAdministrativeUnitId: number | null;
  intermediateAdministrativeUnitId: number | null;
  narrowAdministrativeUnitId: number | null;
  categoryId: number | null;
  typeId: number | null;
  name: string | null;
  onlyPublic: boolean;
};

const emptyComparisonFilter: AssessmentComparisonClientFilter = {
  broadAdministrativeUnitId: null,
  intermediateAdministrativeUnitId: null,
  narrowAdministrativeUnitId: null,
  categoryId: null,
  typeId: null,
  name: null,
  onlyPublic: false,
};

const AssessmentsSidebar = ({
  citiesOptions,
  loadingCities,
  locationCategories,
  locationTypes,
  selectedCity,
  setCity,
  setState,
  state,
}: {
  citiesOptions: FetchCitiesResponse["cities"] | null;
  loadingCities: boolean;
  locationCategories: FetchLocationCategoriesResponse["categories"];
  locationTypes: FetchLocationTypesResponse["types"];
  selectedCity: FetchCitiesResponse["cities"][number] | null;
  setCity: Dispatch<
    SetStateAction<FetchCitiesResponse["cities"][number] | null>
  >;
  setState: Dispatch<SetStateAction<BrazilianStates>>;
  state: BrazilianStates;
}) => {
  const [categories, setCategories] = useState<
    FetchMapAssessmentComparisonCategoriesResponse["categories"]
  >([]);
  const [selectedCategory, setSelectedCategory] = useState<
    FetchMapAssessmentComparisonCategoriesResponse["categories"][number] | null
  >(null);
  const [locations, setLocations] = useState<
    FetchMapAssessmentComparisonResultsResponse["locations"]
  >([]);
  const [filteredLocations, setFilteredLocations] = useState<
    FetchMapAssessmentComparisonResultsResponse["locations"]
  >([]);
  const [selectedLocationIds, setSelectedLocationIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [filter, setFilter] = useState<AssessmentComparisonClientFilter>(
    emptyComparisonFilter,
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const [fetchCategories, loadingCategories] =
    useFetchMapAssessmentComparisonCategories({
      callbacks: {
        onSuccess: (response) => {
          const nextCategories = response.data?.categories ?? [];
          setCategories(nextCategories);
          setSelectedCategory(
            (current) => current ?? nextCategories[0] ?? null,
          );
        },
      },
    });

  const [fetchResults, loadingResults] = useFetchMapAssessmentComparisonResults(
    {
      callbacks: {
        onSuccess: (response) => {
          setLocations(response.data?.locations ?? []);
          setSelectedLocationIds(new Set());
        },
      },
    },
  );

  const applyFilter = useCallback(() => {
    const result: FetchMapAssessmentComparisonResultsResponse["locations"] =
      [];

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
        location.narrowAdministrativeUnitId !== filter.narrowAdministrativeUnitId
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

    if (filter.name) {
      const resultFilteredByName = fuseHaystack.search(filter.name);
      setFilteredLocations(resultFilteredByName.map((result) => result.item));
    } else {
      setFilteredLocations(result);
    }
  }, [filter, locations]);

  useEffect(() => {
    void fetchCategories({});
  }, [fetchCategories]);

  useEffect(() => {
    setLocations([]);
    setSelectedLocationIds(new Set());
    if (!selectedCity || !selectedCategory) return;
    void fetchResults({
      cityId: selectedCity.id,
      categoryId: selectedCategory.id,
    });
  }, [fetchResults, selectedCategory, selectedCity]);

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

  const locationCategoriesOptions = useMemo(() => {
    return [...locationCategories, { id: -1, name: "NENHUMA" }];
  }, [locationCategories]);
  const locationTypesOptions = useMemo(() => {
    return [...locationTypes, { id: -1, name: "NENHUMA" }];
  }, [locationTypes]);

  const hasAnyResult = locations.some(
    (location) => location.hasAssessmentsForSelectedCategory,
  );

  const selectedLocations = useMemo(() => {
    return locations.filter(
      (location) =>
        selectedLocationIds.has(location.id) &&
        location.hasAssessmentsForSelectedCategory,
    );
  }, [locations, selectedLocationIds]);

  const toggleLocation = (location: MapAssessmentComparisonLocation) => {
    if (!location.hasAssessmentsForSelectedCategory) return;
    setSelectedLocationIds((prev) => {
      const next = new Set(prev);
      if (next.has(location.id)) {
        next.delete(location.id);
      } else {
        next.add(location.id);
      }
      return next;
    });
  };

  return (
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
              state,
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
          getOptionLabel={(option) => option.name}
          onChange={(_, v) => setCity(v)}
        />
      </div>

      <CAutocomplete
        label="Categoria de avaliação"
        loading={loadingCategories}
        options={categories}
        value={selectedCategory}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        getOptionLabel={(option) => option.name}
        onChange={(_, value) => setSelectedCategory(value)}
      />

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
          </div>
        </CAccordionSummary>
        <CAccordionDetails>
          <div className="flex flex-col gap-1">
            {!!selectedCity?.broadAdministrativeUnitTitle && (
              <CAutocomplete
                label={selectedCity.broadAdministrativeUnitTitle}
                options={broadUnits}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                loading={loadingCities}
                value={
                  broadUnits.find(
                    (unit) => unit.id === filter.broadAdministrativeUnitId,
                  ) ?? null
                }
                onChange={(_, value) =>
                  setFilter((prev) => ({
                    ...prev,
                    broadAdministrativeUnitId: value?.id ?? null,
                  }))
                }
              />
            )}
            {!!selectedCity?.intermediateAdministrativeUnitTitle && (
              <CAutocomplete
                label={selectedCity.intermediateAdministrativeUnitTitle}
                options={intermediateUnits}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                loading={loadingCities}
                value={
                  intermediateUnits.find(
                    (unit) =>
                      unit.id === filter.intermediateAdministrativeUnitId,
                  ) ?? null
                }
                onChange={(_, value) =>
                  setFilter((prev) => ({
                    ...prev,
                    intermediateAdministrativeUnitId: value?.id ?? null,
                  }))
                }
              />
            )}
            {!!selectedCity?.narrowAdministrativeUnitTitle && (
              <CAutocomplete
                label={selectedCity.narrowAdministrativeUnitTitle}
                options={narrowUnits}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                loading={loadingCities}
                value={
                  narrowUnits.find(
                    (unit) => unit.id === filter.narrowAdministrativeUnitId,
                  ) ?? null
                }
                onChange={(_, value) =>
                  setFilter((prev) => ({
                    ...prev,
                    narrowAdministrativeUnitId: value?.id ?? null,
                  }))
                }
              />
            )}
            <CAutocomplete
              label="Categoria da praça"
              options={locationCategoriesOptions}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              getOptionLabel={(option) => option.name}
              value={
                locationCategoriesOptions.find(
                  (category) => category.id === filter.categoryId,
                ) ?? null
              }
              onChange={(_, value) =>
                setFilter((prev) => ({
                  ...prev,
                  categoryId: value?.id ?? null,
                }))
              }
            />
            <CAutocomplete
              label="Tipo"
              options={locationTypesOptions}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              getOptionLabel={(option) => option.name}
              value={
                locationTypesOptions.find(
                  (type) => type.id === filter.typeId,
                ) ?? null
              }
              onChange={(_, value) =>
                setFilter((prev) => ({
                  ...prev,
                  typeId: value?.id ?? null,
                }))
              }
            />
            <CSwitch
              label="Apenas visibilidade pública"
              checked={filter.onlyPublic}
              onChange={(_, checked) =>
                setFilter((prev) => ({ ...prev, onlyPublic: checked }))
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
        onChange={(event) => {
          setFilter((prev) => ({ ...prev, name: event.target.value }));
        }}
      />

      {(loadingResults || loadingCategories) && (
        <div className="flex w-full flex-col justify-center text-lg">
          <LinearProgress />
          {loadingCategories ?
            "Carregando categorias..."
          : "Carregando praças..."}
        </div>
      )}

      {selectedCategory &&
        !loadingResults &&
        locations.length > 0 &&
        !hasAnyResult && (
          <Chip
            color="warning"
            icon={<IconAlertTriangle />}
            label="Nenhuma praça desta cidade possui avaliação pública nesta categoria."
          />
        )}

      {!selectedCategory && !loadingCategories && (
        <div className="rounded border border-dashed border-gray-300 p-3 text-sm text-gray-600">
          Nenhuma categoria de avaliação pública encontrada.
        </div>
      )}

      <Virtuoso
        data={filteredLocations}
        components={{
          EmptyPlaceholder: () => {
            if (loadingResults || loadingCategories) {
              return;
            }
            return <div>Nenhuma praça encontrada!</div>;
          },
        }}
        style={{ height: "100%", overflowX: "hidden", minHeight: "300px" }}
        itemContent={(_, location) => {
          const isSelected = selectedLocationIds.has(location.id);
          const isComparable = location.hasAssessmentsForSelectedCategory;

          return (
            <div className="pb-2">
              <div
                onClick={() => toggleLocation(location)}
                className={`relative flex h-24 shrink-0 items-end overflow-hidden rounded-xl border shadow-sm transition ${
                  isComparable ?
                    "cursor-pointer hover:scale-[1.02] hover:shadow-md"
                  : "cursor-not-allowed opacity-75"
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

                <div className="absolute left-2 top-2 z-20 rounded-md bg-white/95 px-1 text-black shadow">
                  <CCheckbox
                    checked={isSelected}
                    disabled={!isComparable}
                    onClick={(event) => event.stopPropagation()}
                    onChange={() => toggleLocation(location)}
                  />
                </div>

                {!isComparable && (
                  <div className="absolute right-2 top-2 z-20">
                    <Chip color="warning" size="small" label="Sem avaliação" />
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

      <div className="shrink-0 pt-1">
        <CButton
          disabled={selectedLocations.length === 0}
          onClick={() => setDialogOpen(true)}
        >
          <IconChartBar /> Comparar
        </CButton>
      </div>

      {loadingResults && <CLinearProgress label="Carregando avaliações..." />}

      <AssessmentComparisonDialog
        category={selectedCategory}
        locations={selectedLocations}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
};

export default AssessmentsSidebar;
