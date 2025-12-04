"use client";

import { useHelperCard } from "@/components/context/helperCardContext";
import { useLoadingOverlay } from "@/components/context/loadingContext";
import CDialog from "@/components/ui/dialog/cDialog";
import { _deleteCity } from "@/lib/serverFunctions/serverActions/city";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import { useResettableActionState } from "@/lib/utils/useResettableActionState";
import { BrazilianStates } from "@prisma/client";
import { IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";

const DeleteCityDialog = ({
  open,
  selectedItem,
  cityState,
  onClose,
  reloadItems,
}: {
  open: boolean;
  selectedItem: {
    id: number;
    name: string;
  } | null;
  cityState?: BrazilianStates;
  onClose: () => void;
  reloadItems: () => void;
}) => {
  const { helperCardProcessResponse } = useHelperCard();
  const { setLoadingOverlay } = useLoadingOverlay();
  const [state, formAction, isPending, resetState] = useResettableActionState(
    _deleteCity,
    {
      responseInfo: { statusCode: 0 } as APIResponseInfo,
      data: null,
    },
  );
  const [numberOfLocations, setNumberOfLocations] = useState(0);
  useEffect(() => {
    helperCardProcessResponse(state?.responseInfo);
    if (isPending) {
      setLoadingOverlay({ show: true, message: "Excluindo..." });
    } else {
      setLoadingOverlay({ show: false });
    }
    if (state?.responseInfo.statusCode === 200) {
      reloadItems();
      resetState();
      setNumberOfLocations(0);
      onClose();
    } else if (
      state?.responseInfo.statusCode === 403 &&
      state.data?.numberOfLocations &&
      state.data?.numberOfLocations > 0
    ) {
      setNumberOfLocations(state.data?.numberOfLocations);
    }
  }, [
    isPending,
    state,
    helperCardProcessResponse,
    reloadItems,
    setLoadingOverlay,
    resetState,
    onClose,
  ]);
  return (
    <CDialog
      isForm
      action={formAction}
      open={open}
      onClose={onClose}
      title={"Excluir cidade"}
      subtitle={`${cityState} - ${selectedItem?.name}`}
      confirmChildren={<IconTrash />}
      confirmColor="error"
    >
      <div className="flex flex-col gap-1">
        <input type="hidden" name="cityId" value={selectedItem?.id} />
        {numberOfLocations > 0 && (
          <>
            <div className="text-red-500">{`Erro ao excluir cidade!`}</div>
            <div>{`Existem ${numberOfLocations} praças associadas a essa cidade!`}</div>
          </>
        )}
      </div>
    </CDialog>
  );
};

export default DeleteCityDialog;
