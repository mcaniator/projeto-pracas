"use client";

import { QuestionGeometryTypes } from "@prisma/client";
import { IconCheck, IconTrash } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";

import CDialog from "../../../../../../../components/ui/dialog/cDialog";
import { ResponseGeometry } from "../../../../../../../lib/types/assessments/geometry";

const MapProvider = dynamic(() => import("./MapProvider"), {
  ssr: false,
});

const MapDialog = ({
  openMapDialog,
  onClose,
  questionId,
  initialGeometries,
  geometryType,
  questionName,
  finalized,
  handleQuestionGeometryChange,
}: {
  openMapDialog: boolean;
  onClose: () => void;
  questionId: number;
  initialGeometries: ResponseGeometry[] | undefined;
  geometryType: QuestionGeometryTypes[];
  questionName: string;
  finalized: boolean;
  handleQuestionGeometryChange: (
    questionId: number,
    geometries: ResponseGeometry[],
  ) => void;
}) => {
  const [isInSelectMode, setIsInSelectMode] = useState(false);

  const mapProviderRef = useRef<{
    saveGeometries: () => void;
    removeSelectedFeature: () => void;
  } | null>(null);

  const handleConcluir = () => {
    if (mapProviderRef.current) {
      mapProviderRef.current.saveGeometries();
    }
    onClose();
  };

  const handleChangeIsInSelectMode = (val: boolean) => {
    setIsInSelectMode(val);
  };

  const handleDeleteGeometry = () => {
    if (mapProviderRef.current) {
      mapProviderRef.current.removeSelectedFeature();
    }
    handleChangeIsInSelectMode(false);
  };
  return (
    <CDialog
      fullScreen
      disableContentPadding
      title={"Geometrias"}
      subtitle={questionName}
      open={openMapDialog}
      onClose={onClose}
      onConfirm={handleConcluir}
      confirmChildren={finalized ? undefined : <IconCheck />}
      onCancel={handleDeleteGeometry}
      cancelSx={{ backgroundColor: "error.main" }}
      cancelChildren={isInSelectMode ? <IconTrash /> : undefined}
    >
      <div className="flex h-full flex-col">
        <MapProvider
          geometryType={geometryType}
          questionId={questionId}
          initialGeometries={initialGeometries}
          handleQuestionGeometryChange={handleQuestionGeometryChange}
          handleChangeIsInSelectMode={handleChangeIsInSelectMode}
          finalized={finalized}
          ref={mapProviderRef}
        />
      </div>
    </CDialog>
  );
};

export default MapDialog;
