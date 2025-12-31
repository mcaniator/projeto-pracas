"use client";

import { CategoryOrType } from "@/app/admin/map/register/registerSteps/addressStep";
import DeleteLocationCateogryOrTypeDialog from "@/app/admin/map/register/registerSteps/parametersDialogs/deleteLocationCateogoryOrTypeDialog";
import LocationCategoryOrTypeSaveDialog from "@/app/admin/map/register/registerSteps/parametersDialogs/locationCategoryOrTypeSaveDialog";
import CImageInput from "@/components/ui/CImageInput";
import CSwitch from "@/components/ui/cSwtich";
import { useFetchLocationCategories } from "@/lib/serverFunctions/apiCalls/locationCategory";
import { useFetchLocationTypes } from "@/lib/serverFunctions/apiCalls/locationType";
import { FetchLocationTypesResponse } from "@/lib/serverFunctions/queries/locationType";
import { Divider } from "@mui/material";
import { IconPencil, IconPlus } from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import CAutocomplete from "../../../../../components/ui/cAutoComplete";
import CTextField from "../../../../../components/ui/cTextField";
import { FetchLocationCategoriesResponse } from "../../../../../lib/serverFunctions/queries/locationCategory";
import { ParkRegisterData } from "../../../../../lib/types/parks/parkRegister";

const BasicInfoStep = ({
  parkData,
  setEnableNextStep,
  setParkData,
  activateReloadLocationCategoriesOnClose,
  activateReloadLocationTypesOnClose,
}: {
  parkData: ParkRegisterData;
  setEnableNextStep: React.Dispatch<React.SetStateAction<boolean>>;
  setParkData: React.Dispatch<React.SetStateAction<ParkRegisterData>>;
  activateReloadLocationCategoriesOnClose: () => void;
  activateReloadLocationTypesOnClose: () => void;
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

  const [selectedItemToEdit, setSelectedItemToEdit] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [itemType, setItemType] = useState<CategoryOrType>("CATEGORY");

  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  useEffect(() => {
    setEnableNextStep(requiredFieldsFilled.name);
  }, [requiredFieldsFilled, setEnableNextStep]);

  const [_fetchLocationCategories, loadingCategories] =
    useFetchLocationCategories({
      callbacks: {
        onSuccess: (response) => {
          setLocationCategories(response.data?.categories ?? []);
        },
      },
    });
  const [_fetchLocationTypes, loadingTypes] = useFetchLocationTypes({
    callbacks: {
      onSuccess: (response) => {
        setLocationTypes(response.data?.types ?? []);
      },
    },
  });

  const loadLocationCategories = useCallback(async () => {
    await _fetchLocationCategories({});
  }, [_fetchLocationCategories]);

  const loadLocationTypes = useCallback(async () => {
    await _fetchLocationTypes({});
  }, [_fetchLocationTypes]);

  useEffect(() => {
    void loadLocationCategories();
  }, [loadLocationCategories]);

  useEffect(() => {
    void loadLocationTypes();
  }, [loadLocationTypes]);

  // #region memos
  const autocompleteCategoryValue = useMemo(() => {
    return locationCategories.find((o) => o.id === parkData.categoryId);
  }, [locationCategories, parkData.categoryId]);

  const autocompleteTypeValue = useMemo(() => {
    return locationTypes.find((o) => o.id === parkData.typeId);
  }, [locationTypes, parkData.typeId]);

  // #endregion
  return (
    <div className="flex flex-col gap-1">
      <Divider />
      <h3>Nome</h3>
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
      <Divider />
      <h3>Situação cadastral</h3>
      <CSwitch
        label="É praça"
        checked={parkData.isPark}
        onChange={(e) => {
          setParkData((prev) => ({ ...prev, isPark: e.target.checked }));
        }}
      />
      <CSwitch
        label="Inativo ou não encontrado"
        checked={parkData.inactiveNotFound}
        onChange={(e) => {
          setParkData((prev) => ({
            ...prev,
            inactiveNotFound: e.target.checked,
          }));
        }}
      />
      <Divider />
      <h3>Categorização</h3>
      <CAutocomplete
        onChange={(_, e) => {
          setParkData((prev) => ({ ...prev, typeId: e?.id ?? null }));
        }}
        onSuffixButtonClick={() => {
          setSelectedItemToEdit(null);
          setItemType("TYPE");
          setOpenSaveDialog(true);
        }}
        onAppendIconButtonClick={() => {
          const id = parkData.typeId;
          const name = locationTypes.find(
            (l) => l.id === parkData.typeId,
          )?.name;
          if (id && name) {
            setSelectedItemToEdit({ id, name });
            setItemType("TYPE");
            setOpenSaveDialog(true);
          }
        }}
        value={autocompleteTypeValue}
        label="Tipo"
        appendIconButton={<IconPencil />}
        className="w-full"
        options={locationTypes}
        getOptionLabel={(i) => i.name}
        loading={loadingTypes}
        isOptionEqualToValue={(o, v) => o.id === v.id}
        suffixButtonChildren={<IconPlus />}
      />
      <CAutocomplete
        onChange={(_, e) => {
          setParkData((prev) => ({ ...prev, categoryId: e?.id ?? null }));
        }}
        onSuffixButtonClick={() => {
          setSelectedItemToEdit(null);
          setItemType("CATEGORY");
          setOpenSaveDialog(true);
        }}
        onAppendIconButtonClick={() => {
          const id = parkData.categoryId;
          const name = locationCategories.find(
            (l) => l.id === parkData.categoryId,
          )?.name;
          if (id && name) {
            setSelectedItemToEdit({ id, name });
            setItemType("CATEGORY");
            setOpenSaveDialog(true);
          }
        }}
        value={autocompleteCategoryValue}
        label="Categoria"
        appendIconButton={<IconPencil />}
        className="w-full"
        options={locationCategories}
        getOptionLabel={(i) => i.name}
        loading={loadingCategories}
        isOptionEqualToValue={(o, v) => o.id === v.id}
        suffixButtonChildren={<IconPlus />}
      />
      <LocationCategoryOrTypeSaveDialog
        reloadItems={() => {
          if (itemType === "CATEGORY") {
            activateReloadLocationCategoriesOnClose();
            void loadLocationCategories();
          } else {
            activateReloadLocationTypesOnClose();
            void loadLocationTypes();
          }
        }}
        selectedItem={selectedItemToEdit}
        itemType={itemType}
        open={openSaveDialog}
        onClose={() => {
          setOpenSaveDialog(false);
        }}
        openDeleteDialog={() => {
          setOpenSaveDialog(false);
          setOpenDeleteDialog(true);
        }}
      />
      <DeleteLocationCateogryOrTypeDialog
        selectedItem={selectedItemToEdit}
        itemType={itemType}
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
        }}
        reloadItems={() => {
          if (itemType === "CATEGORY") {
            activateReloadLocationCategoriesOnClose();
            void loadLocationCategories();
          } else {
            activateReloadLocationTypesOnClose();
            void loadLocationTypes();
          }
        }}
      />
      <Divider />
      <h3>Imagem</h3>
      <div className="w-fit">
        <CImageInput
          label="Imagem"
          files={parkData.mainImage}
          previewWidth={300}
          previewHeight={200}
          targetCompressionSize={1}
          emitFiles={(f) => {
            setParkData((prev) => ({ ...prev, mainImage: f[0] ?? null }));
          }}
        />
      </div>
    </div>
  );
};

export default BasicInfoStep;
