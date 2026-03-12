import FormsDataGrid from "@/app/admin/assessments/assessmentCreation/formsDataGrid";
import LocationSelector from "@/components/locationSelector/locationSelector";
import CDateTimePicker from "@/components/ui/cDateTimePicker";
import CDialog from "@/components/ui/dialog/cDialog";
import { FetchLocationsResponse } from "@/lib/serverFunctions/queries/location";
import { _createAssessmentV2 } from "@/lib/serverFunctions/serverActions/assessmentUtil";
import { useResettableActionState } from "@/lib/utils/useResettableActionState";
import { Divider, LinearProgress } from "@mui/material";
import { IconCheck } from "@tabler/icons-react";
import dayjs, { Dayjs } from "dayjs";
import { useRouter } from "next-nprogress-bar";
import { startTransition, useMemo, useState } from "react";

const AssessmentCreationDialog = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState<
    FetchLocationsResponse["locations"][number] | null
  >(null);

  const [selectedDateTime, setSelectedDateTime] = useState<Dayjs | null>(
    dayjs(new Date()).second(0).millisecond(0),
  );
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [selectedForm, setSelectedForm] = useState<{ id: number } | null>(null);

  const [formAction, isSaving] = useResettableActionState({
    action: _createAssessmentV2,
    callbacks: {
      onSuccess: (response) => {
        if (!response.data?.assessmentId) {
          return;
        }
        setIsRedirecting(true);
        router.push(`/admin/assessments/${response.data.assessmentId}`);
      },
    },
  });

  const handleSubmit = () => {
    const formData = new FormData();
    if (!selectedLocation || !selectedDateTime || !selectedForm) return;
    formData.append("locationId", selectedLocation.id.toString());
    formData.append("startDate", selectedDateTime.toDate().toISOString());
    formData.append("formId", selectedForm.id.toString());
    startTransition(() => formAction(formData));
  };

  const enableSaveButton = useMemo(() => {
    return !!selectedLocation && !!selectedDateTime && !!selectedForm;
  }, [selectedLocation, selectedDateTime, selectedForm]);

  return (
    <CDialog
      title="Criar avaliação"
      fullScreen
      open={open}
      onClose={onClose}
      onConfirm={handleSubmit}
      confirmChildren={<IconCheck />}
      disableConfirmButton={!enableSaveButton}
      confirmLoading={isSaving}
      removeCloseButton={isRedirecting}
    >
      <div className="flex flex-col gap-1">
        {isRedirecting ?
          <div className="flex w-full flex-col justify-center text-lg">
            <LinearProgress />
            Redirecionando...
          </div>
        : <>
            <h4>Seleção de praça</h4>
            <LocationSelector
              useAccordion
              selectedLocation={selectedLocation}
              onSelectedLocationChange={(v) => {
                setSelectedLocation(v);
              }}
            />
            <Divider />
            <h4>Horário da avaliação</h4>
            <CDateTimePicker
              label="Data de início"
              name="startDate"
              value={selectedDateTime}
              onChange={(e) => {
                setSelectedDateTime(e);
              }}
            />
            <Divider />
            <h4>Seleção de formulário</h4>
            <FormsDataGrid
              selectedForm={selectedForm}
              handleSelectForm={(id) => {
                setSelectedForm({ id });
              }}
            />
          </>
        }
      </div>
    </CDialog>
  );
};

export default AssessmentCreationDialog;
