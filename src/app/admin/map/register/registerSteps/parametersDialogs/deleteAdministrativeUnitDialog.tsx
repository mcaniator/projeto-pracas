"use client";

import { AdministrativeUnitLevel } from "@/app/admin/map/register/registerSteps/addressStep";
import CDialog from "@/components/ui/dialog/cDialog";
import { useDeleteAdministrativeUnit } from "@/lib/serverFunctions/apiCalls/administrativeUnit";
import { FetchCitiesResponse } from "@/lib/serverFunctions/queries/city";
import { IconTrash } from "@tabler/icons-react";
import { FormEventHandler, useState } from "react";

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
  city?: FetchCitiesResponse["cities"][number];
  level: AdministrativeUnitLevel;
  onClose: () => void;
  reloadItems: () => void;
}) => {
  const levelName =
    level === "NARROW" ? city?.narrowAdministrativeUnitTitle
    : level === "INTERMEDIATE" ? city?.intermediateAdministrativeUnitTitle
    : city?.broadAdministrativeUnitTitle;
  const [deleteAdministrativeUnit, isLoading] = useDeleteAdministrativeUnit({
    callbacks: {
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
  });

  const [conflictingLocations, setConflictingLocations] = useState<
    {
      cityId: number;
      cityName: string;
      locations: { name: string }[];
    }[]
  >([]);
  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    void deleteAdministrativeUnit({
      data: new FormData(event.currentTarget),
      projectOptions: { loadingMessage: `Excluindo ${levelName}...` },
    });
  };

  return (
    <CDialog
      isForm
      onSubmit={handleSubmit}
      confirmLoading={isLoading}
      open={open}
      onClose={onClose}
      title={"Excluir " + levelName}
      subtitle={`${selectedItem?.name} - ${city?.name} - ${city?.state}`}
      confirmChildren={<IconTrash />}
      confirmColor="error"
    >
      <div className="flex flex-col gap-1">
        <input type="hidden" name="unitId" value={selectedItem?.id} />
        <input type="hidden" name="unitType" value={level} />
        {conflictingLocations.length > 0 && (
          <>
            <div className="text-red-500">{`Erro ao excluir ${levelName}!`}</div>
            <div>{`Este(a) ${levelName} possui praças associadas:`}</div>
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
