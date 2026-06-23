"use client";

import CDialog from "@/components/ui/dialog/cDialog";
import type { ResponseGeometry } from "@/lib/types/assessments/geometry";
import dynamic from "next/dynamic";

const AssessmentViewerMapProvider = dynamic(
  () => import("./assessmentViewerMapProvider"),
  { ssr: false },
);

const AssessmentGeometryDialog = ({
  geometries,
  locationPolygonGeoJson,
  onClose,
  open,
  questionName,
}: {
  geometries: ResponseGeometry[];
  locationPolygonGeoJson: string | null;
  onClose: () => void;
  open: boolean;
  questionName: string;
}) => (
  <CDialog
    fullScreen
    disableContentPadding
    disableDialogActions
    title={questionName}
    open={open}
    onClose={onClose}
  >
    <div className="flex h-full flex-col">
      <AssessmentViewerMapProvider
        geometries={geometries}
        locationPolygonGeoJson={locationPolygonGeoJson}
      />
    </div>
  </CDialog>
);

export default AssessmentGeometryDialog;
