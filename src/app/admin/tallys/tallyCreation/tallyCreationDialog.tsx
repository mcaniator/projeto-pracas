import TallyProtocolsDataGrid from "@/app/admin/tallys/tallyCreation/tallyProtocolsDataGrid";
import LocationSelector from "@/components/locationSelector/locationSelector";
import CDateTimePicker from "@/components/ui/cDateTimePicker";
import CDialog from "@/components/ui/dialog/cDialog";
import { useCreateTally } from "@/lib/serverFunctions/apiCalls/tally";
import type { FetchLocationsResponse } from "@/lib/serverFunctions/queries/location";
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
    dayjs().second(0).millisecond(0),
  );
  const [selectedTallyProtocol, setSelectedTallyProtocol] =
    useState<{ id: number } | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [createTally, isSaving] = useCreateTally({
    callbacks: {
      onServerSuccess: ({ data }) => {
        if (!data?.tallyId) return;

        setIsRedirecting(true);
        router.push(
          `/admin/tallys/details?tallyId=${data.tallyId}`,
        );
      },
    },
  });

  const handleSubmit = () => {
    if (
      !selectedLocation ||
      !selectedDateTime ||
      !selectedTallyProtocol
    ) {
      return;
    }

    void createTally({
      data: {
        locationId: selectedLocation.id,
        startDate: selectedDateTime.toDate(),
        tallyProtocolId: selectedTallyProtocol.id,
      },
    });
  };

  const enableSaveButton = useMemo(
    () =>
      !!selectedLocation &&
      !!selectedDateTime &&
      !!selectedTallyProtocol,
    [selectedDateTime, selectedLocation, selectedTallyProtocol],
  );

  return (
    <CDialog
      title="Criar contagem"
      fullScreen
      open={open}
      onClose={onClose}
      onConfirm={() => {
        handleSubmit();
      }}
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
              onSelectedLocationChange={setSelectedLocation}
            />
            <Divider />
            <h4>Horário da contagem</h4>
            <CDateTimePicker
              label="Data de início"
              name="startDate"
              value={selectedDateTime}
              onChange={setSelectedDateTime}
            />
            <Divider />
            <h4>Seleção de protocolo</h4>
            <TallyProtocolsDataGrid
              selectedTallyProtocol={selectedTallyProtocol}
              onSelectTallyProtocol={(id) =>
                setSelectedTallyProtocol({ id })
              }
            />
          </>
        }
      </div>
    </CDialog>
  );
};

export default TallyCreationDialog;
