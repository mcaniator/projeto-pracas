"use client";

import type { TallyWithSyncStatus } from "@/app/admin/tallys/tallysClient";
import CLinearProgress from "@/components/ui/CLinearProgress";
import CDialog from "@/components/ui/dialog/cDialog";
import TallyViewer from "@/components/ui/tallyPersonsStatitics/tallyViewer";
import { dateTimeFormatter } from "@/lib/formatters/dateFormatters";
import { useFetchTallyDetails } from "@/lib/serverFunctions/apiCalls/tally";
import type { FetchTallyDetailsResponse } from "@/lib/serverFunctions/queries/tally";
import { IconEye } from "@tabler/icons-react";
import { useEffect, useState } from "react";

const TallyResultDialog = ({
  tally,
  open,
  onClose,
}: {
  tally: TallyWithSyncStatus | null;
  open: boolean;
  onClose: () => void;
}) => {
  const [tallyDetails, setTallyDetails] =
    useState<FetchTallyDetailsResponse["tallyDetails"]>();
  const [fetchTallyDetails, loading] = useFetchTallyDetails({
    callbacks: {
      onSuccess: (response) => {
        setTallyDetails(response.data?.tallyDetails);
      },
    },
  });

  useEffect(() => {
    if (!tally) return;
    void fetchTallyDetails({
      params: {
        tallyId: tally.id,
      },
    });
  }, [tally, fetchTallyDetails]);

  if (!tally) return null;

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
      title={tally.location.name}
      subtitle={`${dateTimeFormatter.format(tally.startDate)} ${tally.endDate ? `- ${dateTimeFormatter.format(tally.endDate)}` : ""}`}
      fullScreen
      confirmChildren={
        <>
          <IconEye />
          Ver preenchimento
        </>
      }
      confirmProps={{
        href: `/admin/tallys/details?tallyId=${tally.id}`,
        loadingOnClick: true,
      }}
    >
      {loading && <CLinearProgress label="Carregando resultados..." />}
      {!loading && tallyDetails && (
        <TallyViewer
          tallySubmission={tallyDetails.tallySubmission}
          locationPolygon={tallyDetails.location}
        />
      )}
      {!loading && !tallyDetails && (
        <div className="p-4 text-center">
          Não foi possível carregar os resultados.
        </div>
      )}
    </CDialog>
  );
};

export default TallyResultDialog;
