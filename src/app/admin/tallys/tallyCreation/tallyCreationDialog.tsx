import LocationSelector from "@/components/locationSelector/locationSelector";
import CDateTimePicker from "@/components/ui/cDateTimePicker";
import CDialog from "@/components/ui/dialog/cDialog";
import { FetchLocationsResponse } from "@/lib/serverFunctions/queries/location";
import { _createTallyV2 } from "@/lib/serverFunctions/serverActions/tallyUtil";
import { useResettableActionState } from "@/lib/utils/useResettableActionState";
import { Divider } from "@mui/material";
import { IconCheck } from "@tabler/icons-react";
import { Dayjs } from "dayjs";
import { startTransition, useMemo, useState } from "react";

const TallyCreationDialog = ({
  open,
  onClose,
  reloadTallys,
}: {
  open: boolean;
  onClose: () => void;
  reloadTallys: () => void;
}) => {
  const [selectedLocation, setSelectedLocation] = useState<
    FetchLocationsResponse["locations"][number] | null
  >(null);

  const [selectedDateTime, setSelectedDateTime] = useState<Dayjs | null>(null);

  const [formAction, isSaving] = useResettableActionState({
    action: _createTallyV2,
    callbacks: {
      onSuccess: () => {
        reloadTallys();
        onClose();
      },
    },
  });

  const handleSubmit = () => {
    const formData = new FormData();
    if (!selectedLocation || !selectedDateTime) return;
    formData.append("locationId", selectedLocation.id.toString());
    formData.append("startDate", selectedDateTime.toDate().toISOString());
    startTransition(() => formAction(formData));
  };

  const enableSaveButton = useMemo(() => {
    return !!selectedLocation && !!selectedDateTime;
  }, [selectedLocation, selectedDateTime]);

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
      </div>
    </CDialog>
  );
};

export default TallyCreationDialog;
