"use client";

import LocationTypeCreationDialog from "@/app/admin/map/register/registerSteps/parametersDialogs/locationTypeCreationDialog";
import { _fetchLocationTypes } from "@/lib/serverFunctions/apiCalls/locationType";
import { FetchLocationTypesResponse } from "@/lib/serverFunctions/queries/locationType";
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
  });
  const [locationCategories, setLocationCategories] = useState<
    FetchLocationCategoriesResponse["categories"]
  >([]);
  const [locationTypes, setLocationTypes] = useState<
    FetchLocationTypesResponse["types"]
  >([]);

  const [loadingCategories, setLoadingCateogries] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);

  const [selectedItemToEdit, setSelectedItemToEdit] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [openCategoryCreationDialog, setOpenCategoryCreationDialog] =
    useState(false);

  const [openTypeCreationDialog, setOpenTypeCreationDialog] = useState(false);

  useEffect(() => {
    setEnableNextStep(requiredFieldsFilled.name);
  }, [requiredFieldsFilled, setEnableNextStep]);

  const loadLocationCategories = useCallback(async () => {
    setLoadingCateogries(true);
    const locationCategoriesResponse = await _fetchLocationCategories();
    setLocationCategories(locationCategoriesResponse.data?.categories ?? []);
    setLoadingCateogries(false);
  }, []);

  const loadLocationTypes = useCallback(async () => {
    setLoadingTypes(true);
    const locationTypesResponse = await _fetchLocationTypes();
    setLocationTypes(locationTypesResponse.data?.types ?? []);
    setLoadingTypes(false);
  }, []);

  useEffect(() => {
    void loadLocationTypes();
    void loadLocationCategories();
  }, [loadLocationCategories, loadLocationTypes]);

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
      <CTextField
        value={parkData.popularName}
        maxCharacters={255}
        label="Nome popular"
        onChange={(e) => {
          setParkData((prev) => ({ ...prev, popularName: e.target.value }));
        }}
        clearable
      />
      <div className="flex w-full flex-col gap-1">
        <CAutocomplete
          onChange={(_, e) => {
            setParkData((prev) => ({ ...prev, categoryId: e?.id ?? null }));
          }}
          onSuffixButtonClick={() => {
            setSelectedItemToEdit(null);
            setOpenCategoryCreationDialog(true);
          }}
          onAppendIconButtonClick={() => {
            const id = parkData.categoryId;
            const name = locationCategories.find(
              (l) => l.id === parkData.categoryId,
            )?.name;
            if (id && name) {
              setSelectedItemToEdit({ id, name });
              setOpenCategoryCreationDialog(true);
            }
          }}
          value={locationCategories.find((o) => o.id === parkData.categoryId)}
          label="Categoria"
          appendIconButton={<IconPencil />}
          className="w-full"
          options={locationCategories}
          getOptionLabel={(i) => i.name}
          loading={loadingCategories}
          isOptionEqualToValue={(o, v) => o.id === v.id}
          suffixButtonChildren={<IconPlus />}
        />

        <CAutocomplete
          onChange={(_, e) => {
            setParkData((prev) => ({ ...prev, typeId: e?.id ?? null }));
          }}
          onSuffixButtonClick={() => {
            setSelectedItemToEdit(null);
            setOpenTypeCreationDialog(true);
          }}
          onAppendIconButtonClick={() => {
            const id = parkData.typeId;
            const name = locationTypes.find(
              (l) => l.id === parkData.typeId,
            )?.name;
            if (id && name) {
              setSelectedItemToEdit({ id, name });
              setOpenTypeCreationDialog(true);
            }
          }}
          value={locationTypes.find((o) => o.id === parkData.typeId)}
          label="Tipo"
          appendIconButton={<IconPencil />}
          className="w-full"
          options={locationTypes}
          getOptionLabel={(i) => i.name}
          loading={loadingTypes}
          isOptionEqualToValue={(o, v) => o.id === v.id}
          suffixButtonChildren={<IconPlus />}
        />
      </div>
      <LocationCategoryCreationDialog
        reloadCategories={() => {
          void loadLocationCategories();
        }}
        selectedCategory={selectedItemToEdit}
        open={openCategoryCreationDialog}
        onClose={() => {
          setOpenCategoryCreationDialog(false);
        }}
      />
      <LocationTypeCreationDialog
        reloadTypes={() => {
          void loadLocationTypes();
        }}
        selectedType={selectedItemToEdit}
        open={openTypeCreationDialog}
        onClose={() => {
          setOpenTypeCreationDialog(false);
        }}
      />
    </div>
  );
};

export default BasicInfoStep;
