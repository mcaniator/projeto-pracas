import FormsDataGrid from "@/app/admin/assessments/assessmentCreation/formsDataGrid";
import LocationSelector from "@/components/locationSelector/locationSelector";
import CDateTimePicker from "@/components/ui/cDateTimePicker";
import CDialog from "@/components/ui/dialog/cDialog";
import { FetchLocationsResponse } from "@/lib/serverFunctions/queries/location";
import { _createAssessmentV2 } from "@/lib/serverFunctions/serverActions/assessmentUtil";
import { useResettableActionState } from "@/lib/utils/useResettableActionState";
import { Divider } from "@mui/material";
import { IconCheck } from "@tabler/icons-react";
import { Dayjs } from "dayjs";
import { startTransition, useMemo, useState } from "react";

const AssessmentCreationDialog = ({
  open,
  onClose,
  reloadAssessments,
}: {
  open: boolean;
  onClose: () => void;
  reloadAssessments: () => void;
}) => {
  const [selectedLocation, setSelectedLocation] = useState<
    FetchLocationsResponse["locations"][number] | null
  >(null);

  const [selectedDateTime, setSelectedDateTime] = useState<Dayjs | null>(null);

  const [selectedForm, setSelectedForm] = useState<{ id: number } | null>(null);

  const [formAction, isSaving] = useResettableActionState({
    action: _createAssessmentV2,
    callbacks: {
      onSuccess: () => {
        reloadAssessments();
        onClose();
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
    >
      <div className="flex flex-col gap-1">
        <h4>Seleção de praça</h4>
        <LocationSelector
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
      </div>
    </CDialog>
  );
};

export default AssessmentCreationDialog;
