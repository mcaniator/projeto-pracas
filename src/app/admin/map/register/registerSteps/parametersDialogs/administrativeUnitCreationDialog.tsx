"use client";

import { AdministrativeUnitLevel } from "@/app/admin/map/register/registerSteps/addressStep";
import CDialog from "@/components/ui/dialog/cDialog";
import { IconTrash } from "@tabler/icons-react";

const AdministrativeUnitCreationDialog = ({
  open,
  onClose,
  level,
  selectedUnit,
}: {
  open: boolean;
  onClose: () => void;
  level: AdministrativeUnitLevel;
  selectedUnit: { id: number; name: string };
}) => {
  const levelName =
    level === "NARROW" ? "estreita"
    : level === "INTERMEDIATE" ? "intermediária"
    : "ampla";
  return (
    <CDialog
      open={open}
      onClose={onClose}
      title={`${selectedUnit ? "Editar" : "Cadastrar"} região administrativa ${levelName}`}
      confirmChildren={selectedUnit ? "Editar" : "Cadastrar"}
      cancelChildren={selectedUnit ? <IconTrash /> : undefined}
    ></CDialog>
  );
};

export default AdministrativeUnitCreationDialog;
