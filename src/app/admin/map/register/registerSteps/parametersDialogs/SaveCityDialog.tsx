"use client";

import { _saveCity } from "@/lib/serverFunctions/serverActions/city";
import { useResettableActionState } from "@/lib/utils/useResettableActionState";
import { Divider } from "@mui/material";
import { BrazilianStates } from "@prisma/client";
import { IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import CAutocomplete from "../../../../../../components/ui/cAutoComplete";
import CTextField from "../../../../../../components/ui/cTextField";
import CDialog from "../../../../../../components/ui/dialog/cDialog";

const SaveCityDialog = ({
  open,
  previouslySelectedState,
  selectedCity,
  adminUnitsSugestions,
  onClose,
  reloadCities,
  openDeleteDialog,
}: {
  open: boolean;
  previouslySelectedState: string;
  selectedCity: {
    id: number;
    name: string;
    narrowAdministrativeUnitTitle?: string | null;
    intermediateAdministrativeUnitTitle?: string | null;
    broadAdministrativeUnitTitle?: string | null;
  } | null;
  adminUnitsSugestions: {
    narrow: string[];
    intermediate: string[];
    broad: string[];
  };
  onClose: () => void;
  reloadCities: () => void;
  openDeleteDialog: () => void;
}) => {
  const [formAction, isPending] = useResettableActionState({
    action: _saveCity,
    callbacks: {
      onSuccess() {
        reloadCities();
        onClose();
      },
    },
  });

  const [cityState, setCityState] = useState(previouslySelectedState);

  useEffect(() => {
    setCityState(previouslySelectedState);
  }, [previouslySelectedState]);
  return (
    <CDialog
      isForm
      action={formAction}
      open={open}
      onClose={onClose}
      onCancel={openDeleteDialog}
      confirmLoading={isPending}
      title={selectedCity ? "Editar cidade" : "Cadastrar cidade"}
      confirmChildren={selectedCity ? "Editar" : "Criar"}
      cancelChildren={selectedCity ? <IconTrash /> : undefined}
      cancelColor="error"
    >
      <input type="hidden" name="state" value={cityState} />
      <input
        type="hidden"
        name="cityId"
        value={selectedCity?.id ?? undefined}
      />
      <CAutocomplete
        label="Estado"
        disableClearable
        value={cityState}
        onChange={(_, e) => {
          setCityState(e);
        }}
        options={Object.values(BrazilianStates)}
      />
      <CTextField
        resetOnFormSubmit={!selectedCity}
        required
        defaultValue={selectedCity?.name ?? ""}
        maxCharacters={255}
        label="Nome"
        name="name"
      />
      <Divider />
      <h5>Nomenclatura de regiões administrativas</h5>
      <CAutocomplete
        defaultValue={selectedCity?.broadAdministrativeUnitTitle}
        textFieldName="broadAdminUnitTitle"
        label="Região administrativa ampla"
        placeholder="Digite ou escolha..."
        options={adminUnitsSugestions.broad}
        freeSolo
      />
      <CAutocomplete
        defaultValue={selectedCity?.intermediateAdministrativeUnitTitle}
        textFieldName="intermediateAdminUnitTitle"
        label="Região administrativa intermediária"
        placeholder="Digite ou escolha..."
        options={adminUnitsSugestions.intermediate}
        freeSolo
      />
      <CAutocomplete
        defaultValue={selectedCity?.narrowAdministrativeUnitTitle}
        textFieldName="narrowAdminUnitTitle"
        label="Região administrativa estreita"
        placeholder="Digite ou escolha..."
        options={adminUnitsSugestions.narrow}
        freeSolo
      />
    </CDialog>
  );
};

export default SaveCityDialog;
