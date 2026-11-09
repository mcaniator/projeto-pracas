"use client";

import { useLoadingOverlay } from "@/components/context/loadingContext";
import { useNetwork } from "@/components/context/networkContext";
import CDialog from "@/components/ui/dialog/cDialog";
import { useAppSnackbar } from "@/lib/hooks/useAppSnackbar";
import { useDeleteBehavioralMap } from "@/lib/serverFunctions/apiCalls/behavioralMapProtocol";
import { LinearProgress } from "@mui/material";
import { IconAlertSquareRounded, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next-nprogress-bar";
import { useState } from "react";

const DeleteBehavioralMapDialog = ({
  open,
  onClose,
  onDeleteSuccess,
  behavioralMapId,
}: {
  open: boolean;
  onClose: () => void;
  onDeleteSuccess: () => Promise<void>;
  behavioralMapId: number;
}) => {
  const { enqueueSnackbar } = useAppSnackbar();
  const { setLoadingOverlay } = useLoadingOverlay();
  const { isConnected } = useNetwork();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [deleteBehavioralMap, isDeleting] = useDeleteBehavioralMap();

  const handleDelete = async () => {
    try {
      setLoadingOverlay({
        show: true,
        message: "Excluindo mapa comportamental...",
      });
      const response = await deleteBehavioralMap({
        data: { behavioralMapId },
      });

      if (response.responseInfo.statusCode === 200) {
        setIsRedirecting(true);
        await onDeleteSuccess();
        router.push("/admin/behavioralMaps");
      }
    } catch {
      enqueueSnackbar("Erro ao excluir mapa comportamental!", {
        variant: "error",
      });
    } finally {
      setLoadingOverlay({ show: false });
    }
  };

  return (
    <CDialog
      title="Excluir mapa comportamental"
      open={open}
      onClose={onClose}
      confirmChildren={
        <>
          <IconTrash />
          Excluir
        </>
      }
      confirmProps={{ disabled: !isConnected || isDeleting || isRedirecting }}
      confirmColor="error"
      onConfirm={() => void handleDelete()}
    >
      <div className="flex flex-col items-center gap-1">
        {isRedirecting ?
          <div className="flex w-full flex-col justify-center text-lg">
            <LinearProgress />
            Redirecionando...
          </div>
        : <>
            <IconAlertSquareRounded size={32} color="red" />
            <p>Tem certeza que deseja excluir este mapa comportamental?</p>
          </>
        }
      </div>
    </CDialog>
  );
};

export default DeleteBehavioralMapDialog;
