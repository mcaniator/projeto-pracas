"use client";

import AssessmentImportDataDialog from "@/app/admin/assessments/details/assessmentImportDataDialog";
import ResponseFormV2, {
  type ResponseFormV2Handle,
} from "@/app/admin/assessments/details/responseFormV2";
import { useLoadingOverlay } from "@/components/context/loadingContext";
import CAdminHeader from "@/components/ui/cAdminHeader";
import CButton from "@/components/ui/cButton";
import { useAppSnackbar } from "@/lib/hooks/useAppSnackbar";
import { FetchAssessmentTreeResponse } from "@/lib/serverFunctions/queries/assessment";
import { useMediaQuery, useTheme } from "@mui/material";
import { IconFileUpload, IconListCheck } from "@tabler/icons-react";
import { useRef, useState } from "react";

const AssessmentClient = ({
  locationId,
  locationName,
  locationPolygonGeoJson,
  assessmentTree,
  finalized,
  userCanEdit,
  canSaveOffline,
  isSQLiteAssessment,
  onIsSQLiteAssessmentChange,
}: {
  locationId: number;
  locationName: string;
  locationPolygonGeoJson: string | null;
  assessmentTree: FetchAssessmentTreeResponse["assessmentTree"];
  finalized: boolean;
  userCanEdit: boolean;
  canSaveOffline: boolean;
  isSQLiteAssessment: boolean;
  onIsSQLiteAssessmentChange: (v: boolean) => void;
}) => {
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down("lg"));
  const responseFormRef = useRef<ResponseFormV2Handle>(null);
  const [openAssessmentImportDialog, setOpenAssessmentImportDialog] =
    useState(false);
  const { setLoadingOverlay } = useLoadingOverlay();
  const { enqueueSnackbar } = useAppSnackbar();
  return (
    <div className="flex h-full flex-col gap-1 overflow-auto bg-white p-2 text-black">
      <CAdminHeader
        title={`Avaliação em ${locationName}`}
        titleIcon={<IconListCheck />}
        append={
          <CButton
            square={isMobileView}
            tooltip="Importar dados"
            onClick={() => {
              setOpenAssessmentImportDialog(true);
            }}
          >
            <IconFileUpload /> {isMobileView ? "" : "Importar"}
          </CButton>
        }
      />

      <ResponseFormV2
        ref={responseFormRef}
        locationId={locationId}
        locationName={locationName}
        locationPolygonGeoJson={locationPolygonGeoJson}
        assessmentTree={assessmentTree}
        finalized={finalized}
        userCanEdit={userCanEdit}
        canSaveOffline={canSaveOffline}
        isSQLiteAssessment={isSQLiteAssessment}
        onIsSQLiteAssessmentChange={onIsSQLiteAssessmentChange}
      />
      <AssessmentImportDataDialog
        open={openAssessmentImportDialog}
        onClose={() => {
          setOpenAssessmentImportDialog(false);
        }}
        onFileInput={(e) => {
          setLoadingOverlay({ show: true, message: "Importando dados..." });
          responseFormRef.current
            ?.importData(e)
            .catch(() => {
              enqueueSnackbar(<>Erro ao importar dados!</>, {
                variant: "error",
              });
            })
            .finally(() => {
              setLoadingOverlay({ show: false });
            });
          setOpenAssessmentImportDialog(false);
        }}
      />
    </div>
  );
};

export default AssessmentClient;
