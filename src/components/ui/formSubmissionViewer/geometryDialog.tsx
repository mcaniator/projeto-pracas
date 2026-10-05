"use client";

import CDialog from "@/components/ui/dialog/cDialog";
import type { ResponseGeometry } from "@/lib/types/formSubmission/responseFormTypes";
import dynamic from "next/dynamic";

const FormSubmissionViewerMapProvider = dynamic(
  () => import("./viewerMapProvider"),
  { ssr: false },
);

const FormSubmissionGeometryDialog = ({
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
      <FormSubmissionViewerMapProvider
        geometries={geometries}
        locationPolygonGeoJson={locationPolygonGeoJson}
      />
    </div>
  </CDialog>
);

export default FormSubmissionGeometryDialog;
