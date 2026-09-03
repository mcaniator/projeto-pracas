"use client";

import { AdministrativeUnitLevel } from "@/app/admin/map/register/registerSteps/addressStep";
import CTextField from "@/components/ui/cTextField";
import CDialog from "@/components/ui/dialog/cDialog";
import { useSaveAdministrativeUnit } from "@/lib/serverFunctions/apiCalls/administrativeUnit";
import { FetchCitiesResponse } from "@/lib/serverFunctions/queries/city";
import { IconTrash } from "@tabler/icons-react";
import { FormEventHandler } from "react";

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
  city?: FetchCitiesResponse["cities"][number];
  selectedUnit: { id: number; name: string } | null;
  reloadItems: () => void;
  openDeleteDialog: () => void;
}) => {
  const [saveAdministrativeUnit, isPending] = useSaveAdministrativeUnit({
    callbacks: {
      onSuccess() {
        reloadItems();
      },
    },
  });
  const levelName =
    level === "NARROW" ? city?.narrowAdministrativeUnitTitle
    : level === "INTERMEDIATE" ? city?.intermediateAdministrativeUnitTitle
    : city?.broadAdministrativeUnitTitle;
  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    void saveAdministrativeUnit({ data: new FormData(event.currentTarget) });
  };

  return (
    <CDialog
      isForm
      onSubmit={handleSubmit}
      open={open}
      onClose={onClose}
      confirmLoading={isPending}
      title={`${selectedUnit ? "Editar" : "Cadastrar"} ${levelName}`}
      subtitle={`${city?.name} - ${city?.state}`}
      confirmChildren={selectedUnit ? "Editar" : "Cadastrar"}
      cancelChildren={selectedUnit ? <IconTrash /> : undefined}
      cancelColor="error"
      onCancel={openDeleteDialog}
    >
      <div className="flex flex-col gap-1">
        <input type="hidden" name="cityId" value={city?.id} />
        <input type="hidden" name="levelName" value={levelName ?? ""} />
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
