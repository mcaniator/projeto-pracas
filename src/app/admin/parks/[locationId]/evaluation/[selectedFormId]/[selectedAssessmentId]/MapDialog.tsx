"use client";

import { QuestionGeometryTypes } from "@prisma/client";
import { IconCheck, IconTrash } from "@tabler/icons-react";
import { useRef, useState } from "react";

import CDialog from "../../../../../../../components/ui/dialog/cDialog";
import { ResponseGeometry } from "../../../../../../../lib/types/assessments/geometry";
import MapProvider from "./MapProvider";

const MapDialog = ({
  openMapDialog,
  onClose,
  questionId,
  initialGeometries,
  geometryType,
  questionName,
  handleQuestionGeometryChange,
}: {
  openMapDialog: boolean;
  onClose: () => void;
  questionId: number;
  initialGeometries: ResponseGeometry[] | undefined;
  geometryType: QuestionGeometryTypes[];
  questionName: string;
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
      title={"Geometrias"}
      subtitle={questionName}
      open={openMapDialog}
      onClose={onClose}
      onConfirm={handleConcluir}
      confirmChildren={<IconCheck />}
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
          ref={mapProviderRef}
        />
      </div>
    </CDialog>
  );
};

export default MapDialog;
