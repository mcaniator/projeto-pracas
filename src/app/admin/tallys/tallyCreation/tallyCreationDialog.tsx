import LocationSelector from "@/components/locationSelector/locationSelector";
import CDateTimePicker from "@/components/ui/cDateTimePicker";
import CDialog from "@/components/ui/dialog/cDialog";
import { useCreateTally } from "@/lib/serverFunctions/apiCalls/tally";
import { FetchLocationsResponse } from "@/lib/serverFunctions/queries/location";
import { Divider, LinearProgress } from "@mui/material";
import { IconCheck } from "@tabler/icons-react";
import dayjs, { Dayjs } from "dayjs";
import { useRouter } from "next-nprogress-bar";
import { useMemo, useState } from "react";

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

  const [createTally, isSaving] = useCreateTally({
    callbacks: {
      onSuccess: (response) => {
        if (!response.data?.tallyId) {
          return;
        }
        setIsRedirecting(true);
        router.push(`/admin/tallys/fill?tallyId=${response.data.tallyId}`);
      },
    },
  });

  const handleSubmit = () => {
    const formData = new FormData();
    if (!selectedLocation || !selectedDateTime) return;
    formData.append("locationId", selectedLocation.id.toString());
    formData.append("startDate", selectedDateTime.toDate().toISOString());
    void createTally({ data: formData });
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
