import FormsDataGrid from "@/app/admin/assessments/assessmentCreation/formsDataGrid";
import { LocationsMapClientFilter } from "@/app/admin/map/PolygonsAndClientContainer";
import CAutocomplete from "@/components/ui/cAutoComplete";
import CDateTimePicker from "@/components/ui/cDateTimePicker";
import CDialog from "@/components/ui/dialog/cDialog";
import { useFetchCities } from "@/lib/serverFunctions/apiCalls/city";
import { useFetchLocations } from "@/lib/serverFunctions/apiCalls/location";
import { FetchCitiesResponse } from "@/lib/serverFunctions/queries/city";
import { FetchLocationsResponse } from "@/lib/serverFunctions/queries/location";
import { _createAssessmentV2 } from "@/lib/serverFunctions/serverActions/assessmentUtil";
import { useResettableActionState } from "@/lib/utils/useResettableActionState";
import { Divider } from "@mui/material";
import { BrazilianStates } from "@prisma/client";
import { IconCheck } from "@tabler/icons-react";
import { Dayjs } from "dayjs";
import Fuse from "fuse.js";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const AssessmentCreationDialog = ({
  open,
  onClose,
  reloadAssessments,
}: {
  open: boolean;
  onClose: () => void;
  reloadAssessments: () => void;
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

  const [selectedLocation, setSelectedLocation] = useState<
    FetchLocationsResponse["locations"][number] | null
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

  const [selectedDateTime, setSelectedDateTime] = useState<Dayjs | null>(null);

  const [selectedForm, setSelectedForm] = useState<{ id: number } | null>(null);

  const [formAction, isSaving] = useResettableActionState({
    action: _createAssessmentV2,
    callbacks: {
      onSuccess: () => {
        reloadAssessments();
        onClose();
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

    setSelectedLocation(null);

    if (filter.name) {
      const resultFilteredByName = fuseHaystack.search(filter.name);
      setFilteredLocations(resultFilteredByName.map((result) => result.item));
    } else {
      setFilteredLocations(result);
    }
  }, [filter, locations]);

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

  const handleSubmit = () => {
    const formData = new FormData();
    if (!selectedLocation || !selectedDateTime || !selectedForm) return;
    formData.append("locationId", selectedLocation.id.toString());
    formData.append("startDate", selectedDateTime.toDate().toISOString());
    formData.append("formId", selectedForm.id.toString());
    startTransition(() => formAction(formData));
  };

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

  const enableSaveButton = useMemo(() => {
    return !!selectedLocation && !!selectedDateTime && !!selectedForm;
  }, [selectedLocation, selectedDateTime, selectedForm]);

  return (
    <CDialog
      title="Criar avaliação"
      fullScreen
      open={open}
      onClose={onClose}
      onConfirm={handleSubmit}
      confirmChildren={<IconCheck />}
      disableConfirmButton={!enableSaveButton}
      confirmLoading={isSaving}
    >
      <div className="flex flex-col gap-1">
        <h4>Seleção de praça</h4>
        <div className="flex gap-1">
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
            onChange={(_, v) => setSelectedCity(v)}
          />
        </div>
        <CAutocomplete
          label="Região administrativa ampla"
          options={broadUnits}
          getOptionLabel={(o) => o.name}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          loading={loadingCities}
          value={
            broadUnits.find((b) => b.id === filter.broadAdministrativeUnitId) ??
            null
          }
          onChange={(_, v) =>
            setFilter({
              ...filter,
              broadAdministrativeUnitId: v?.id ?? null,
            })
          }
        />
        <CAutocomplete
          label="Região administrativa intermendiária"
          options={intermediateUnits}
          getOptionLabel={(o) => o.name}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          loading={loadingCities}
          value={
            intermediateUnits.find(
              (b) => b.id === filter.intermediateAdministrativeUnitId,
            ) ?? null
          }
          onChange={(_, v) =>
            setFilter({
              ...filter,
              intermediateAdministrativeUnitId: v?.id ?? null,
            })
          }
        />
        <CAutocomplete
          label="Região administrativa estreita"
          options={narrowUnits}
          getOptionLabel={(o) => o.name}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          loading={loadingCities}
          value={
            narrowUnits.find(
              (b) => b.id === filter.narrowAdministrativeUnitId,
            ) ?? null
          }
          onChange={(_, v) =>
            setFilter({
              ...filter,
              narrowAdministrativeUnitId: v?.id ?? null,
            })
          }
        />
        <CAutocomplete
          label="Praça"
          loading={loadingLocations}
          options={filteredLocations}
          getOptionLabel={(o) => o.name}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          value={selectedLocation}
          onChange={(_, v) => setSelectedLocation(v)}
        />
        <Divider />
        <h4>Horário da avaliação</h4>
        <CDateTimePicker
          label="Data de início"
          name="startDate"
          value={selectedDateTime}
          onChange={(e) => {
            setSelectedDateTime(e);
          }}
        />
        <Divider />
        <h4>Seleção de formulário</h4>
        <FormsDataGrid
          selectedForm={selectedForm}
          handleSelectForm={(id) => {
            setSelectedForm({ id });
          }}
        />
      </div>
    </CDialog>
  );
};

export default AssessmentCreationDialog;
