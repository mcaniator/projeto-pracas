"use client";

import { AdministrativeUnitLevel } from "@/app/admin/map/register/registerSteps/addressStep";
import CDialog from "@/components/ui/dialog/cDialog";
import { _deleteAdministrativeUnit } from "@/lib/serverFunctions/serverActions/administrativeUnit";
import { useResettableActionState } from "@/lib/utils/useResettableActionState";
import { BrazilianStates } from "@prisma/client";
import { IconTrash } from "@tabler/icons-react";
import { useState } from "react";

const DeleteAdministrativeUnitDialog = ({
  open,
  selectedItem,
  city,
  level,
  onClose,
  reloadItems,
}: {
  open: boolean;
  selectedItem: {
    id: number;
    name: string;
  } | null;
  city?: { id: number; name: string; state: BrazilianStates };
  level: AdministrativeUnitLevel;
  onClose: () => void;
  reloadItems: () => void;
}) => {
  const [formAction] = useResettableActionState(
    _deleteAdministrativeUnit,
    {
      onSuccess() {
        reloadItems();
        setConflictingLocations([]);
        onClose();
      },
      onError(state) {
        if (state.data?.conflictingItems) {
          setConflictingLocations(state.data?.conflictingItems ?? []);
        }
      },
    },
    {
      loadingMessage: "Excluindo região administrativa...",
    },
  );
  const levelName =
    level === "NARROW" ? "estreita"
    : level === "INTERMEDIATE" ? "intermediária"
    : "ampla";
  const [conflictingLocations, setConflictingLocations] = useState<
    {
      cityId: number;
      cityName: string;
      locations: { name: string }[];
    }[]
  >([]);

  return (
    <CDialog
      isForm
      action={formAction}
      open={open}
      onClose={onClose}
      title={"Excluir região administrativa " + levelName}
      subtitle={`${selectedItem?.name} - ${city?.name} - ${city?.state}`}
      confirmChildren={<IconTrash />}
      confirmColor="error"
    >
      <div className="flex flex-col gap-1">
        <input type="hidden" name="unitId" value={selectedItem?.id} />
        <input type="hidden" name="unitType" value={level} />
        {conflictingLocations.length > 0 && (
          <>
            <div className="text-red-500">{`Erro ao excluir região administrativa ${levelName}!`}</div>
            <div>{"Esta região administrativa possui praças associadas:"}</div>
            <ul className="list-inside list-disc space-y-2">
              {conflictingLocations.map((cl, index) => (
                <li key={index} className="list-disc px-2 py-3 font-bold">
                  {cl.cityName}
                  <ul className="list-inside list-disc space-y-2">
                    {cl.locations.map((l) => (
                      <li key={index} className="list-disc px-2 py-3 font-bold">
                        {l.name}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </CDialog>
  );
};

export default DeleteAdministrativeUnitDialog;
