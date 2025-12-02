"use client";

import { BrazilianStates } from "@prisma/client";
import { useActionState, useEffect, useState } from "react";

import { useHelperCard } from "../../../../../../components/context/helperCardContext";
import { useLoadingOverlay } from "../../../../../../components/context/loadingContext";
import CAutocomplete from "../../../../../../components/ui/cAutoComplete";
import CTextField from "../../../../../../components/ui/cTextField";
import CDialog from "../../../../../../components/ui/dialog/cDialog";
import { _createCity } from "../../../../../../lib/serverFunctions/serverActions/city";

const CityCreationDialog = ({
  open,
  previouslySelectedState,
  onClose,
  reloadCities,
}: {
  open: boolean;
  previouslySelectedState: string;
  onClose: () => void;
  reloadCities: () => void;
}) => {
  const { helperCardProcessResponse } = useHelperCard();
  const { setLoadingOverlay } = useLoadingOverlay();
  const [state, formAction, isPending] = useActionState(_createCity, {
    responseInfo: { statusCode: 0 },
  });
  useEffect(() => {
    helperCardProcessResponse(state.responseInfo);

    if (state.responseInfo.statusCode === 201) {
      reloadCities();
    }
  }, [isPending, state, helperCardProcessResponse, reloadCities]);
  useEffect(() => {
    if (isPending) {
      setLoadingOverlay({ show: true, message: "Salvando cidade..." });
    } else {
      setLoadingOverlay({ show: false });
    }
  }, [isPending, setLoadingOverlay]);
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
      title="Cadastrar cidade"
      confirmChildren={"Criar"}
    >
      <input type="hidden" name="state" value={cityState} />
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
        resetOnFormSubmit
        required
        maxCharacters={255}
        label="Nome"
        name="name"
      />
    </CDialog>
  );
};

export default CityCreationDialog;
