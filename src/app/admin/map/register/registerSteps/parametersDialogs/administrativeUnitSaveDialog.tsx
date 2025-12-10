"use client";

import { AdministrativeUnitLevel } from "@/app/admin/map/register/registerSteps/addressStep";
import CTextField from "@/components/ui/cTextField";
import CDialog from "@/components/ui/dialog/cDialog";
import { _saveAdministrativeUnit } from "@/lib/serverFunctions/serverActions/administrativeUnit";
import { useResettableActionState } from "@/lib/utils/useResettableActionState";
import { BrazilianStates } from "@prisma/client";
import { IconTrash } from "@tabler/icons-react";
import { useEffect } from "react";

const AdministrativeUnitSaveDialog = ({
  open,
  onClose,
  level,
  city,
  selectedUnit,
  reloadItems,
  openDeleteDialog,
}: {
  open: boolean;
  onClose: () => void;
  level: AdministrativeUnitLevel;
  city?: { id: number; name: string; state: BrazilianStates };
  selectedUnit: { id: number; name: string } | null;
  reloadItems: () => void;
  openDeleteDialog: () => void;
}) => {
  const [formAction, state] = useResettableActionState(
    _saveAdministrativeUnit,
    {
      loadingMessage: "Salvando...",
    },
  );
  const levelName =
    level === "NARROW" ? "estreita"
    : level === "INTERMEDIATE" ? "intermediária"
    : "ampla";

  useEffect(() => {
    if (state.responseInfo.statusCode === 201) {
      reloadItems();
    }
  }, [state, reloadItems]);
  return (
    <CDialog
      isForm
      action={formAction}
      open={open}
      onClose={onClose}
      title={`${selectedUnit ? "Editar" : "Cadastrar"} região administrativa ${levelName}`}
      subtitle={`${city?.name} - ${city?.state}`}
      confirmChildren={selectedUnit ? "Editar" : "Cadastrar"}
      cancelChildren={selectedUnit ? <IconTrash /> : undefined}
      cancelColor="error"
      onCancel={openDeleteDialog}
    >
      <div className="flex flex-col gap-1">
        <input type="hidden" name="cityId" value={city?.id} />
        <input
          type="hidden"
          name="unitId"
          value={selectedUnit?.id ?? undefined}
        />
        <input type="hidden" name="unitType" value={level} />
        <CTextField
          resetOnFormSubmit={!selectedUnit}
          defaultValue={selectedUnit?.name ?? ""}
          maxCharacters={255}
          label="Nome"
          name="unitName"
        />
      </div>
    </CDialog>
  );
};

export default AdministrativeUnitSaveDialog;
