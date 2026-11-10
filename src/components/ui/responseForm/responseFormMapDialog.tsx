"use client";

import CDialog from "@/components/ui/dialog/cDialog";
import { ResponseGeometry } from "@/lib/types/formSubmission/responseFormTypes";
import { QuestionGeometryTypes } from "@prisma/client";
import { IconCheck, IconTrash } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";

const ResponseFormMapProvider = dynamic(
  () => import("./responseFormMapProvider"),
  {
    ssr: false,
  },
);

const ResponseFormMapDialog = ({
  openMapDialog,
  onClose,
  questionId,
  locationPolygonGeoJson,
  initialGeometries,
  geometryType,
  questionName,
  finalized,
  handleResponseGeometryChange,
}: {
  openMapDialog: boolean;
  onClose: () => void;
  questionId: number;
  locationPolygonGeoJson: string | null;
  initialGeometries: ResponseGeometry[] | undefined;
  geometryType: QuestionGeometryTypes[];
  questionName: string;
  finalized: boolean;
  handleResponseGeometryChange: (
    questionId: number,
    geometries: ResponseGeometry[],
  ) => void;
}) => {
  const [hasSelectedGeometry, setHasSelectedGeometry] = useState(false);

  const mapProviderRef = useRef<{
    saveGeometries: () => void;
    removeSelectedFeature: () => void;
  } | null>(null);

  const handleClose = () => {
    setHasSelectedGeometry(false);
    onClose();
  };

  const handleConcluir = () => {
    if (!finalized) mapProviderRef.current?.saveGeometries();
    handleClose();
  };

  const handleDeleteGeometry = () => {
    mapProviderRef.current?.removeSelectedFeature();
  };
  return (
    <CDialog
      fullScreen
      disableContentPadding
      title={"Geometrias"}
      subtitle={questionName}
      open={openMapDialog}
      onClose={handleClose}
      onConfirm={handleConcluir}
      confirmChildren={finalized ? undefined : <IconCheck />}
      onCancel={handleDeleteGeometry}
      cancelSx={{ backgroundColor: "error.main" }}
      cancelChildren={hasSelectedGeometry ? <IconTrash /> : undefined}
    >
      <div className="flex h-full flex-col">
        <ResponseFormMapProvider
          geometryType={geometryType}
          questionId={questionId}
          locationPolygonGeoJson={locationPolygonGeoJson}
          initialGeometries={initialGeometries}
          handleResponseGeometryChange={handleResponseGeometryChange}
          onGeometrySelectionChange={setHasSelectedGeometry}
          finalized={finalized}
          ref={mapProviderRef}
        />
      </div>
    </CDialog>
  );
};

export default ResponseFormMapDialog;
