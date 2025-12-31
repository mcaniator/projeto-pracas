import SaveCityDialog from "@/app/admin/map/register/registerSteps/parametersDialogs/SaveCityDialog";
import AdministrativeUnitSaveDialog from "@/app/admin/map/register/registerSteps/parametersDialogs/administrativeUnitSaveDialog";
import DeleteAdministrativeUnitDialog from "@/app/admin/map/register/registerSteps/parametersDialogs/deleteAdministrativeUnitDialog";
import DeleteCityDialog from "@/app/admin/map/register/registerSteps/parametersDialogs/deleteCityDialog";
import { useFetchCities } from "@/lib/serverFunctions/apiCalls/city";
import { Divider } from "@mui/material";
import { BrazilianStates } from "@prisma/client";
import { IconPencil, IconPlus } from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import CAutocomplete from "../../../../../components/ui/cAutoComplete";
import CTextField from "../../../../../components/ui/cTextField";
import { FetchCitiesResponse } from "../../../../../lib/serverFunctions/queries/city";
import { ParkRegisterData } from "../../../../../lib/types/parks/parkRegister";

type UnitType =
  FetchCitiesResponse["cities"][number]["narrowAdministrativeUnit"];

export type CategoryOrType = "CATEGORY" | "TYPE";
export type AdministrativeUnitLevel = "NARROW" | "INTERMEDIATE" | "BROAD";

const AddressStep = ({
  parkData,
  setEnableNextStep,
  setParkData,
  activateReloadCitiesOnClose,
}: {
  parkData: ParkRegisterData;
  setEnableNextStep: React.Dispatch<React.SetStateAction<boolean>>;
  setParkData: React.Dispatch<React.SetStateAction<ParkRegisterData>>;
  activateReloadCitiesOnClose: () => void;
}) => {
  const [openCitySaveDialog, setOpenCitySaveDialog] = useState(false);
  const [openCityDeleDialog, setOpenCityDeleteDialog] = useState(false);
  const [openUnitSaveDialog, setOpenUnitSaveDialog] = useState(false);
  const [openUnitDeleteDialog, setOpenUnitDeleteDialog] = useState(false);

  const [requiredFieldsFilled, setRequiredFieldsFilled] = useState({
    firstStreet: false,
    cityId: false,
  });
  const [citiesOptions, setCitiesOptions] = useState<
    FetchCitiesResponse["cities"] | null
  >(null);

  const [selectedItemToEdit, setSelectedItemToEdit] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [unitLevel, setUnitLevel] = useState<AdministrativeUnitLevel>("BROAD");

  const [_fetchCities, isLoadingCities] = useFetchCities({
    callbacks: {
      onSuccess(response) {
        setCitiesOptions(response.data?.cities ?? []);
      },
    },
  });
  const loadCitiesOptions = useCallback(async () => {
    await _fetchCities({
      state: parkData.state,
      includeAdminstrativeRegions: true,
    });
  }, [parkData.state, _fetchCities]);
  const [cityAdmUnits, setCityAdmUnits] = useState<{
    narrowUnits: UnitType;
    intermediateUnits: UnitType;
    broadUnits: UnitType;
  }>({
    narrowUnits: [],
    intermediateUnits: [],
    broadUnits: [],
  });

  useEffect(() => {
    void loadCitiesOptions();
  }, [loadCitiesOptions]);

  useEffect(() => {
    setEnableNextStep(
      requiredFieldsFilled.firstStreet && requiredFieldsFilled.cityId,
    );
  }, [requiredFieldsFilled, setEnableNextStep]);
  useEffect(() => {
    const cityOption = citiesOptions?.find((c) => c.id === parkData.cityId);
    setCityAdmUnits({
      broadUnits: cityOption?.broadAdministrativeUnit ?? [],
      intermediateUnits: cityOption?.intermediateAdministrativeUnit ?? [],
      narrowUnits: cityOption?.narrowAdministrativeUnit ?? [],
    });
  }, [citiesOptions, parkData.cityId]);

  useEffect(() => {
    setRequiredFieldsFilled({
      firstStreet: !!parkData.firstStreet,
      cityId: !!parkData.cityId,
    });
  }, [parkData.cityId, parkData.firstStreet]);

  // #region memos

  const autocompleteCityValue = useMemo(() => {
    return citiesOptions?.find((c) => c.id === parkData.cityId) ?? null;
  }, [citiesOptions, parkData.cityId]);

  const autocompleteBroadUnitValue = useMemo(() => {
    return (
      cityAdmUnits.broadUnits?.find(
        (b) => b.id === parkData.broadAdministrativeUnitId,
      ) ?? null
    );
  }, [cityAdmUnits.broadUnits, parkData.broadAdministrativeUnitId]);

  const autocompleteIntermediateUnitValue = useMemo(() => {
    return (
      cityAdmUnits.intermediateUnits?.find(
        (b) => b.id === parkData.intermediateAdministrativeUnitId,
      ) ?? null
    );
  }, [
    cityAdmUnits.intermediateUnits,
    parkData.intermediateAdministrativeUnitId,
  ]);

  const autocompleteNarrowUnitValue = useMemo(() => {
    return (
      cityAdmUnits.narrowUnits?.find(
        (b) => b.id === parkData.narrowAdministrativeUnitId,
      ) ?? null
    );
  }, [cityAdmUnits.narrowUnits, parkData.narrowAdministrativeUnitId]);

  const parkCity = useMemo(() => {
    return citiesOptions?.find((c) => c.id === parkData.cityId);
  }, [citiesOptions, parkData.cityId]);

  const selectedItemToEditState = useMemo(() => {
    return citiesOptions?.find((c) => c.id === selectedItemToEdit?.id)?.state;
  }, [citiesOptions, selectedItemToEdit]);

  // #endregion

  return (
    <div className="flex flex-col gap-1">
      <Divider />
      <h3>Localização</h3>
      <CAutocomplete
        label="Estado"
        disableClearable
        options={Object.values(BrazilianStates)}
        value={parkData.state}
        onChange={(_, e) =>
          setParkData((prev) => ({
            ...prev,
            state: e,
            cityId: null,
            narrowAdministrativeUnitId: null,
            intermediateAdministrativeUnitId: null,
            broadAdministrativeUnitId: null,
          }))
        }
      />

      <CAutocomplete
        value={autocompleteCityValue}
        className="w-full"
        label="Cidade"
        error={!requiredFieldsFilled.cityId}
        options={citiesOptions ?? []}
        getOptionLabel={(o) => o.name}
        isOptionEqualToValue={(o, v) => o.id === v.id}
        suffixButtonChildren={<IconPlus />}
        appendIconButton={<IconPencil />}
        onAppendIconButtonClick={() => {
          setSelectedItemToEdit({
            id: parkData.cityId!,
            name: parkCity?.name ?? "",
          });
          setOpenCitySaveDialog(true);
        }}
        loading={isLoadingCities}
        onSuffixButtonClick={() => {
          setSelectedItemToEdit(null);
          setOpenCitySaveDialog((prev) => !prev);
        }}
        onChange={(_, v) => {
          setParkData((prev) => ({
            ...prev,
            cityId: v?.id ?? null,
            narrowAdministrativeUnitId: null,
            intermediateAdministrativeUnitId: null,
            broadAdministrativeUnitId: null,
          }));
        }}
      />

      <CAutocomplete
        className="w-full"
        label="Região administrativa ampla"
        value={autocompleteBroadUnitValue}
        options={cityAdmUnits.broadUnits ?? []}
        loading={isLoadingCities}
        suffixButtonChildren={<IconPlus />}
        appendIconButton={<IconPencil />}
        getOptionLabel={(o) => o.name}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        onSuffixButtonClick={() => {
          setSelectedItemToEdit(null);
          setUnitLevel("BROAD");
          setOpenUnitSaveDialog(true);
        }}
        onAppendIconButtonClick={() => {
          setUnitLevel("BROAD");
          setSelectedItemToEdit({
            id: parkData.broadAdministrativeUnitId!,
            name:
              cityAdmUnits.broadUnits?.find(
                (b) => b.id === parkData.broadAdministrativeUnitId!,
              )?.name ?? "",
          });
          setOpenUnitSaveDialog(true);
        }}
        onChange={(_, v) => {
          setParkData((prev) => ({
            ...prev,
            broadAdministrativeUnitId: v?.id ?? null,
          }));
        }}
      />

      <CAutocomplete
        className="w-full"
        label="Região administrativa intermendiária"
        value={autocompleteIntermediateUnitValue}
        options={cityAdmUnits.intermediateUnits ?? []}
        loading={isLoadingCities}
        suffixButtonChildren={<IconPlus />}
        appendIconButton={<IconPencil />}
        getOptionLabel={(o) => o.name}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        onSuffixButtonClick={() => {
          setSelectedItemToEdit(null);
          setUnitLevel("INTERMEDIATE");
          setOpenUnitSaveDialog(true);
        }}
        onAppendIconButtonClick={() => {
          setUnitLevel("INTERMEDIATE");
          setSelectedItemToEdit({
            id: parkData.intermediateAdministrativeUnitId!,
            name:
              cityAdmUnits.intermediateUnits?.find(
                (b) => b.id === parkData.intermediateAdministrativeUnitId!,
              )?.name ?? "",
          });
          setOpenUnitSaveDialog(true);
        }}
        onChange={(_, v) => {
          setParkData((prev) => ({
            ...prev,
            intermediateAdministrativeUnitId: v?.id ?? null,
          }));
        }}
      />

      <CAutocomplete
        className="w-full"
        label="Região administrativa estreita"
        value={autocompleteNarrowUnitValue}
        options={cityAdmUnits.narrowUnits ?? []}
        loading={isLoadingCities}
        suffixButtonChildren={<IconPlus />}
        appendIconButton={<IconPencil />}
        getOptionLabel={(o) => o.name}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        onSuffixButtonClick={() => {
          setSelectedItemToEdit(null);
          setUnitLevel("NARROW");
          setOpenUnitSaveDialog(true);
        }}
        onAppendIconButtonClick={() => {
          setUnitLevel("NARROW");
          setSelectedItemToEdit({
            id: parkData.narrowAdministrativeUnitId!,
            name:
              cityAdmUnits.narrowUnits?.find(
                (b) => b.id === parkData.narrowAdministrativeUnitId!,
              )?.name ?? "",
          });
          setOpenUnitSaveDialog(true);
        }}
        onChange={(_, v) => {
          setParkData((prev) => ({
            ...prev,
            narrowAdministrativeUnitId: v?.id ?? null,
          }));
        }}
      />

      <CTextField
        maxCharacters={255}
        required
        debounce={500}
        onDebounceInit={() => {
          setRequiredFieldsFilled((prev) => ({ ...prev, firstStreet: false }));
        }}
        label="Primeira rua"
        value={parkData.firstStreet}
        onChange={(e) => {
          setParkData((prev) => ({ ...prev, firstStreet: e.target.value }));
        }}
      />
      <CTextField
        maxCharacters={255}
        debounce={500}
        label="Segunda rua"
        value={parkData.secondStreet}
        onChange={(e) => {
          setParkData((prev) => ({ ...prev, secondStreet: e.target.value }));
        }}
      />
      <CTextField
        maxCharacters={255}
        debounce={500}
        label="Terceira rua"
        value={parkData.thirdStreet}
        onChange={(e) => {
          setParkData((prev) => ({ ...prev, thirdStreet: e.target.value }));
        }}
      />
      <CTextField
        maxCharacters={255}
        debounce={500}
        label="Quarta rua"
        value={parkData.fourthStreet}
        onChange={(e) => {
          setParkData((prev) => ({ ...prev, fourthStreet: e.target.value }));
        }}
      />
      <SaveCityDialog
        open={openCitySaveDialog}
        onClose={() => {
          setOpenCitySaveDialog(false);
        }}
        selectedCity={selectedItemToEdit}
        previouslySelectedState={parkData.state}
        reloadCities={() => {
          activateReloadCitiesOnClose();
          void loadCitiesOptions();
        }}
        openDeleteDialog={() => {
          setSelectedItemToEdit({
            id: parkData.cityId!,
            name: parkCity?.name ?? "",
          });
          setOpenCitySaveDialog(false);
          setOpenCityDeleteDialog(true);
        }}
      />
      <DeleteCityDialog
        selectedItem={selectedItemToEdit}
        open={openCityDeleDialog}
        cityState={selectedItemToEditState}
        reloadItems={() => {
          setParkData((prev) => ({
            ...prev,
            cityId: null,
            narrowAdministrativeUnitId: null,
            intermediateAdministrativeUnitId: null,
            broadAdministrativeUnitId: null,
          }));
          setSelectedItemToEdit(null);
          activateReloadCitiesOnClose();
          void loadCitiesOptions();
        }}
        onClose={() => {
          setOpenCityDeleteDialog(false);
        }}
      />
      <AdministrativeUnitSaveDialog
        open={openUnitSaveDialog}
        reloadItems={() => {
          activateReloadCitiesOnClose();
          void loadCitiesOptions();
        }}
        onClose={() => {
          setOpenUnitSaveDialog(false);
        }}
        openDeleteDialog={() => {
          setOpenUnitSaveDialog(false);
          setOpenUnitDeleteDialog(true);
        }}
        selectedUnit={selectedItemToEdit}
        city={parkCity}
        level={unitLevel}
      />
      <DeleteAdministrativeUnitDialog
        open={openUnitDeleteDialog}
        onClose={() => {
          setOpenUnitDeleteDialog(false);
        }}
        reloadItems={() => {
          switch (unitLevel) {
            case "NARROW":
              setParkData((prev) => ({
                ...prev,
                narrowAdministrativeUnitId: null,
              }));
              break;
            case "INTERMEDIATE":
              setParkData((prev) => ({
                ...prev,
                intermediateAdministrativeUnitId: null,
              }));
              break;
            case "BROAD":
              setParkData((prev) => ({
                ...prev,
                broadAdministrativeUnitId: null,
              }));
              break;
          }
          setSelectedItemToEdit(null);
          activateReloadCitiesOnClose();
          void loadCitiesOptions();
        }}
        selectedItem={selectedItemToEdit}
        city={parkCity}
        level={unitLevel}
      />
    </div>
  );
};

export default AddressStep;
