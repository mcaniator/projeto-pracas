import LocationSelector from "@/components/locationSelector/locationSelector";
import CDateTimePicker from "@/components/ui/cDateTimePicker";
import CDialog from "@/components/ui/dialog/cDialog";
import { useCreateBehavioralMap } from "@/lib/serverFunctions/apiCalls/behavioralMapProtocol";
import type { FetchLocationsResponse } from "@/lib/serverFunctions/queries/location";
import { Divider, LinearProgress } from "@mui/material";
import { IconCheck } from "@tabler/icons-react";
import dayjs, { type Dayjs } from "dayjs";
import { useRouter } from "next-nprogress-bar";
import { useMemo, useState } from "react";

import BehavioralMapProtocolsDataGrid from "./behavioralMapProtocolsDataGrid";

export default function BehavioralMapCreationDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState<
    FetchLocationsResponse["locations"][number] | null
  >(null);
  const [selectedDateTime, setSelectedDateTime] = useState<Dayjs | null>(
    dayjs().second(0).millisecond(0),
  );
  const [selectedBehavioralMapProtocolId, setSelectedBehavioralMapProtocolId] =
    useState<number | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [createBehavioralMap, isSaving] = useCreateBehavioralMap({
    callbacks: {
      onServerSuccess: ({ data }) => {
        if (!data?.behavioralMapId) return;
        setIsRedirecting(true);
        router.push(
          `/admin/behavioralMaps/details?behavioralMapId=${data.behavioralMapId}`,
        );
      },
    },
  });

  const handleSubmit = () => {
    if (
      !selectedLocation ||
      !selectedDateTime ||
      !selectedBehavioralMapProtocolId
    )
      return;
    void createBehavioralMap({
      data: {
        locationId: selectedLocation.id,
        startDate: selectedDateTime.toDate(),
        behavioralMapProtocolId: selectedBehavioralMapProtocolId,
      },
    });
  };

  const enabledSaveButton = useMemo(
    () =>
      !!selectedLocation &&
      !!selectedDateTime &&
      !!selectedBehavioralMapProtocolId,
    [selectedLocation, selectedDateTime, selectedBehavioralMapProtocolId],
  );

  return (
    <CDialog
      title="Criar mapa comportamental"
      fullScreen
      open={open}
      onClose={onClose}
      onConfirm={handleSubmit}
      confirmChildren={<IconCheck />}
      disableConfirmButton={!enabledSaveButton}
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
            <h4>Horário do mapa comportamental</h4>
            <CDateTimePicker
              label="Data de início"
              name="startDate"
              value={selectedDateTime}
              onChange={setSelectedDateTime}
            />
            <Divider />
            <h4>Seleção de protocolo</h4>
            <BehavioralMapProtocolsDataGrid
              selectedId={selectedBehavioralMapProtocolId}
              onSelect={setSelectedBehavioralMapProtocolId}
            />
          </>
        }
      </div>
    </CDialog>
  );
}
