import LocationSelector from "@/components/locationSelector/locationSelector";
import CDateTimePicker from "@/components/ui/cDateTimePicker";
import CDialog from "@/components/ui/dialog/cDialog";
import { FetchLocationsResponse } from "@/lib/serverFunctions/queries/location";
import { _createTallyV2 } from "@/lib/serverFunctions/serverActions/tallyUtil";
import { useResettableActionState } from "@/lib/utils/useResettableActionState";
import { Divider, LinearProgress } from "@mui/material";
import { IconCheck } from "@tabler/icons-react";
import dayjs, { Dayjs } from "dayjs";
import { useRouter } from "next-nprogress-bar";
import { startTransition, useMemo, useState } from "react";

const TallyCreationDialog = ({
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

  const [formAction, isSaving] = useResettableActionState({
    action: _createTallyV2,
    callbacks: {
      onSuccess: (response) => {
        if (!response.data?.tallyId) {
          return;
        }
        setIsRedirecting(true);
        router.push(`/admin/tallys/${response.data.tallyId}/fill`);
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
      title="Criar contagem"
      fullScreen
      open={open}
      onClose={onClose}
      onConfirm={handleSubmit}
      confirmChildren={<IconCheck />}
      disableConfirmButton={!enableSaveButton}
      confirmLoading={isSaving || isRedirecting}
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
            <h4>Horário da contagem</h4>
            <CDateTimePicker
              label="Data de início"
              name="startDate"
              value={selectedDateTime}
              onChange={(e) => {
                setSelectedDateTime(e);
              }}
            />
          </>
        }
      </div>
    </CDialog>
  );
};

export default TallyCreationDialog;
