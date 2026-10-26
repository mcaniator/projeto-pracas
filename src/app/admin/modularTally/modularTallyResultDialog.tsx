"use client";

import type { ModularTallyWithSyncStatus } from "@/app/admin/modularTally/modularTallysClient";
import CLinearProgress from "@/components/ui/CLinearProgress";
import CDialog from "@/components/ui/dialog/cDialog";
import ModularTallyViewer from "@/components/ui/tallyPersonsStatitics/modularTallyViewer";
import { dateTimeFormatter } from "@/lib/formatters/dateFormatters";
import { useFetchModularTallyDetails } from "@/lib/serverFunctions/apiCalls/modularTally";
import type { FetchModularTallyDetailsResponse } from "@/lib/serverFunctions/queries/modularTally";
import { IconEye } from "@tabler/icons-react";
import { useEffect, useState } from "react";

const ModularTallyResultDialog = ({
  modularTally,
  open,
  onClose,
}: {
  modularTally: ModularTallyWithSyncStatus | null;
  open: boolean;
  onClose: () => void;
}) => {
  const [modularTallyDetails, setModularTallyDetails] =
    useState<FetchModularTallyDetailsResponse["modularTallyDetails"]>();
  const [fetchModularTallyDetails, loading] = useFetchModularTallyDetails({
    callbacks: {
      onSuccess: (response) => {
        setModularTallyDetails(response.data?.modularTallyDetails);
      },
    },
  });

  useEffect(() => {
    if (!modularTally) return;
    void fetchModularTallyDetails({
      params: {
        modularTallyId: modularTally.id,
      },
    });
  }, [modularTally, fetchModularTallyDetails]);

  if (!modularTally) return null;

  return (
    <CDialog
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDialogContent-root": {
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden",
        },
      }}
      title={modularTally.location.name}
      subtitle={`${dateTimeFormatter.format(modularTally.startDate)} ${modularTally.endDate ? `- ${dateTimeFormatter.format(modularTally.endDate)}` : ""}`}
      fullScreen
      confirmChildren={
        <>
          <IconEye />
          Ver preenchimento
        </>
      }
      confirmProps={{
        href: `/admin/modularTally/details?modularTallyId=${modularTally.id}`,
        loadingOnClick: true,
      }}
    >
      {loading && <CLinearProgress label="Carregando resultados..." />}
      {!loading && modularTallyDetails && (
        <ModularTallyViewer
          modularTallySubmission={modularTallyDetails.modularTallySubmission}
          locationPolygon={modularTallyDetails.location}
        />
      )}
      {!loading && !modularTallyDetails && (
        <div className="p-4 text-center">
          Não foi possível carregar os resultados.
        </div>
      )}
    </CDialog>
  );
};

export default ModularTallyResultDialog;
