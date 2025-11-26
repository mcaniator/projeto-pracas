"use client";

import { Skeleton } from "@mui/material";
import { IconPencil, IconPlus } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";

import CAutocomplete from "../../../../../components/ui/cAutoComplete";
import CButton from "../../../../../components/ui/cButton";
import CTextField from "../../../../../components/ui/cTextField";
import { _fetchLocationCategories } from "../../../../../lib/serverFunctions/apiCalls/locationCategory";
import { FetchLocationCategoriesResponse } from "../../../../../lib/serverFunctions/queries/locationCategory";
import { ParkRegisterData } from "../../../../../lib/types/parks/parkRegister";
import LocationCategoryCreationDialog from "./parametersDialogs/locationCategoryCreationDialog";

const BasicInfoStep = ({
  parkData,
  setEnableNextStep,
  setParkData,
}: {
  parkData: ParkRegisterData;
  setEnableNextStep: React.Dispatch<React.SetStateAction<boolean>>;
  setParkData: React.Dispatch<React.SetStateAction<ParkRegisterData>>;
}) => {
  const [requiredFieldsFilled, setRequiredFieldsFilled] = useState({
    name: false,
    firstStreet: false,
  });
  const [locationCategories, setLocationCategories] = useState<
    FetchLocationCategoriesResponse["categories"]
  >([]);
  const [loadingCategories, setLoadingCateogries] = useState(false);

  const [openCategoryCreationDialog, setOpenCategoryCreationDialog] =
    useState(false);

  useEffect(() => {
    setEnableNextStep(
      requiredFieldsFilled.name && requiredFieldsFilled.firstStreet,
    );
  }, [requiredFieldsFilled, setEnableNextStep]);

  const loadLocationCategories = useCallback(async () => {
    setLoadingCateogries(true);
    const locationCategoriesResponse = await _fetchLocationCategories();
    setLocationCategories(locationCategoriesResponse.data?.categories ?? []);
    setLoadingCateogries(false);
  }, []);

  useEffect(() => {
    void loadLocationCategories();
  }, [loadLocationCategories]);
  return (
    <div className="flex flex-col gap-1">
      <CTextField
        value={parkData.name}
        maxCharacters={255}
        required
        label="Nome"
        onChange={(e) => {
          setParkData((prev) => ({ ...prev, name: e.target.value }));
        }}
        onRequiredCheck={(e) => {
          setRequiredFieldsFilled((prev) => ({ ...prev, name: e }));
        }}
      />
      <CTextField maxCharacters={255} label="Nome popular" />
      <div className="flex w-full gap-1">
        {loadingCategories ?
          <Skeleton height={53} variant="rectangular" sx={{ width: "100%" }} />
        : <>
            <CAutocomplete
              onChange={(_, e) => {
                setParkData((prev) => ({ ...prev, categoryId: e?.id ?? null }));
              }}
              label="Categoria"
              appendIconButton={<IconPencil />}
              className="w-full"
              options={locationCategories}
              getOptionLabel={(i) => i.name}
              isOptionEqualToValue={(o, v) => o.id === v.id}
            />
            <CButton
              square
              onClick={() => {
                setOpenCategoryCreationDialog((prev) => !prev);
              }}
            >
              <IconPlus />
            </CButton>
          </>
        }
      </div>
      <LocationCategoryCreationDialog
        reloadCategories={() => {
          void loadLocationCategories();
        }}
        open={openCategoryCreationDialog}
        onClose={() => {
          setOpenCategoryCreationDialog(false);
        }}
      />
    </div>
  );
};

export default BasicInfoStep;
