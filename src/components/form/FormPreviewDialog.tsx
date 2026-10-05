"use client";

import CLinearProgress from "@/components/ui/CLinearProgress";
import CSwitch from "@/components/ui/cSwtich";
import CTabs from "@/components/ui/cTabs";
import CDialog from "@/components/ui/dialog/cDialog";
import FormSubmissionViewer from "@/components/ui/formSubmissionViewer/formSubmissionViewer";
import type {
  ResponseFormV2Handle,
  ResponseFormValuesChange,
} from "@/components/ui/responseForm/responseFormV2";
import type {
  FormValues,
  ResponseFormGeometry,
} from "@/lib/types/formSubmission/responseFormTypes";
import type { FormStructure } from "@/lib/types/forms/formStructure";
import { Tab } from "@mui/material";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { buildFormPreviewSubmission } from "./formPreviewUtils";

const ResponseFormV2 = dynamic(
  () => import("@/components/ui/responseForm/responseFormV2"),
  {
    ssr: false,
    loading: () => <CLinearProgress label="Carregando prévia..." />,
  },
);

type PreviewViewMode = "form" | "result";

const previewViewModes: { label: string; value: PreviewViewMode }[] = [
  { label: "Preenchimento", value: "form" },
  { label: "Resultado", value: "result" },
];

const FormPreviewDialog = ({
  open,
  onClose,
  formStructure,
}: {
  open: boolean;
  onClose: () => void;
  formStructure: FormStructure;
}) => {
  const responseFormRef = useRef<ResponseFormV2Handle>(null);
  const [viewMode, setViewMode] = useState<PreviewViewMode>("form");
  const [showOnlyPublicQuestions, setShowOnlyPublicQuestions] = useState(false);
  const formSubmission = useMemo(
    () => buildFormPreviewSubmission({ formStructure }),
    [formStructure],
  );
  const [previewValues, setPreviewValues] = useState<FormValues>(
    formSubmission.responsesFormValues,
  );
  const [previewGeometries, setPreviewGeometries] = useState<
    ResponseFormGeometry[]
  >([]);

  useEffect(() => {
    responseFormRef.current?.reset({
      responsesFormValues: formSubmission.responsesFormValues,
      geometries: formSubmission.geometries,
    });
    setPreviewValues(formSubmission.responsesFormValues);
    setPreviewGeometries([]);
    setViewMode("form");
    setShowOnlyPublicQuestions(false);
  }, [formSubmission]);

  const handleValuesChange = useCallback(
    ({ values }: ResponseFormValuesChange) => {
      setPreviewValues({ ...values });
    },
    [],
  );

  return (
    <CDialog
      fullScreen
      disableDialogActions
      title="Prévia do formulário"
      open={open}
      onClose={onClose}
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <div className="shrink-0">
          <CTabs
            value={viewMode}
            onChange={(_, value: PreviewViewMode) => setViewMode(value)}
            aria-label="Modo de visualização da prévia do formulário"
          >
            {previewViewModes.map((option) => (
              <Tab
                key={option.value}
                value={option.value}
                label={option.label}
              />
            ))}
          </CTabs>
        </div>

        <div
          className={
            viewMode === "form" ?
              "flex min-h-0 w-full flex-1 flex-col"
            : "hidden"
          }
        >
          <ResponseFormV2
            ref={responseFormRef}
            formSubmission={formSubmission}
            readOnly={false}
            onValuesChange={handleValuesChange}
            onGeometriesChange={(change) =>
              setPreviewGeometries(change.geometries)
            }
          />
        </div>

        {viewMode === "result" && (
          <div className="flex min-h-0 w-full flex-1 flex-col gap-2 overflow-auto">
            <CSwitch
              checked={showOnlyPublicQuestions}
              label="Mostrar apenas questões públicas"
              onChange={(_, checked) => setShowOnlyPublicQuestions(checked)}
            />
            <FormSubmissionViewer
              formSubmission={{
                formStructure: formSubmission.formStructure,
                responsesFormValues: previewValues,
                geometries: previewGeometries,
              }}
              filterNonPublicQuestions={showOnlyPublicQuestions}
            />
          </div>
        )}
      </div>
    </CDialog>
  );
};

export default FormPreviewDialog;
