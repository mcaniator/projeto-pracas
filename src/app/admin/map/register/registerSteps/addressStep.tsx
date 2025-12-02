import { BrazilianStates } from "@prisma/client";
import { IconPlus } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";

import CAutocomplete from "../../../../../components/ui/cAutoComplete";
import CButton from "../../../../../components/ui/cButton";
import CSkeletonGroup from "../../../../../components/ui/cSkeletonGroup";
import CTextField from "../../../../../components/ui/cTextField";
import { _fetchCities } from "../../../../../lib/serverFunctions/apiCalls/city";
import { FetchCitiesResponse } from "../../../../../lib/serverFunctions/queries/city";
import { ParkRegisterData } from "../../../../../lib/types/parks/parkRegister";
import CityCreationDialog from "./parametersDialogs/cityCreationDialog";

type UnitType =
  FetchCitiesResponse["cities"][number]["narrowAdministrativeUnit"];

const AddressStep = ({
  parkData,
  setEnableNextStep,
  setParkData,
}: {
  parkData: ParkRegisterData;
  setEnableNextStep: React.Dispatch<React.SetStateAction<boolean>>;
  setParkData: React.Dispatch<React.SetStateAction<ParkRegisterData>>;
}) => {
  const [openCityCreationDialog, setOpenCityCreationDialog] = useState(false);
  const [requiredFieldsFilled, setRequiredFieldsFilled] = useState({
    firstStreet: false,
    cityId: false,
  });
  const [citiesOptions, setCitiesOptions] = useState<
    FetchCitiesResponse["cities"] | null
  >(null);
  const [isLoadingCity, setIsLoadingCity] = useState(false);
  const loadCitiesOptions = useCallback(async () => {
    setIsLoadingCity(true);
    const response = await _fetchCities({
      state: parkData.state,
      includeAdminstrativeRegions: true,
    });
    setCitiesOptions(response.data?.cities ?? []);
    setIsLoadingCity(false);
  }, [parkData.state]);
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
  }, [citiesOptions]);

  return (
    <div className="flex flex-col gap-1">
      <CAutocomplete
        label="Estado"
        disableClearable
        options={Object.values(BrazilianStates)}
        value={parkData.state}
        onChange={(_, e) => setParkData((prev) => ({ ...prev, state: e }))}
      />
      {isLoadingCity ?
        <CSkeletonGroup quantity={4} />
      : <>
          <div className="flex w-full gap-1">
            <CAutocomplete
              className="w-full"
              label="Cidade"
              options={citiesOptions ?? []}
              getOptionLabel={(o) => o.name}
              isOptionEqualToValue={(o, v) => o.id === v.id}
            />
            <CButton
              square
              onClick={() => {
                setOpenCityCreationDialog((prev) => !prev);
              }}
            >
              <IconPlus />
            </CButton>
          </div>
          <div className="flex w-full gap-1">
            <CAutocomplete
              className="w-full"
              label="Região administrativa ampla"
              options={cityAdmUnits.broadUnits ?? []}
            />
            <CButton square>
              <IconPlus />
            </CButton>
          </div>
          <div className="flex w-full gap-1">
            <CAutocomplete
              className="w-full"
              label="Região administrativa intermendiária"
              options={cityAdmUnits.intermediateUnits ?? []}
            />
            <CButton square>
              <IconPlus />
            </CButton>
          </div>
          <div className="flex w-full gap-1">
            <CAutocomplete
              className="w-full"
              label="Região administrativa intermendiária"
              options={cityAdmUnits.intermediateUnits ?? []}
            />
            <CButton square>
              <IconPlus />
            </CButton>
          </div>
          <div className="flex w-full gap-1">
            <CAutocomplete
              className="w-full"
              label="Região administrativa estreita"
              options={cityAdmUnits.narrowUnits ?? []}
            />
            <CButton square>
              <IconPlus />
            </CButton>
          </div>
        </>
      }

      <CTextField
        maxCharacters={255}
        required
        label="Primeira rua"
        value={parkData.name}
        onRequiredCheck={(e) => {
          setRequiredFieldsFilled((prev) => ({ ...prev, firstStreet: e }));
        }}
      />
      <CTextField maxCharacters={255} label="Segunda rua" />
      <CTextField maxCharacters={255} label="Terceira rua" />
      <CTextField maxCharacters={255} label="Quarta rua" />
      <CityCreationDialog
        open={openCityCreationDialog}
        onClose={() => {
          setOpenCityCreationDialog(false);
        }}
        previouslySelectedState={parkData.state}
        reloadCities={() => {
          void loadCitiesOptions();
        }}
      />
    </div>
  );
};

export default AddressStep;
