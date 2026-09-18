import ModularTallyTemplatesDataGrid from "@/app/admin/tallys/modularTallyCreation/modularTallyTemplatesDataGrid";
import LocationSelector from "@/components/locationSelector/locationSelector";
import CDateTimePicker from "@/components/ui/cDateTimePicker";
import CDialog from "@/components/ui/dialog/cDialog";
import { useCreateModularTally } from "@/lib/serverFunctions/apiCalls/modularTally";
import type { FetchLocationsResponse } from "@/lib/serverFunctions/queries/location";
import { Divider, LinearProgress } from "@mui/material";
import { IconCheck } from "@tabler/icons-react";
import dayjs, { Dayjs } from "dayjs";
import { useRouter } from "next-nprogress-bar";
import { useMemo, useState } from "react";

const ModularTallyCreationDialog = ({
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
  const [selectedModularTallyTemplate, setSelectedModularTallyTemplate] =
    useState<{ id: number } | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [createModularTally, isSaving] = useCreateModularTally({
    callbacks: {
      onServerSuccess: ({ data }) => {
        if (!data?.modularTallyId) return;

        setIsRedirecting(true);
        router.push("/admin/modularTally");
      },
    },
  });

  const handleSubmit = () => {
    if (
      !selectedLocation ||
      !selectedDateTime ||
      !selectedModularTallyTemplate
    ) {
      return;
    }

    void createModularTally({
      data: {
        locationId: selectedLocation.id,
        startDate: selectedDateTime.toDate(),
        modularTallyTemplateId: selectedModularTallyTemplate.id,
      },
    });
  };

  const enableSaveButton = useMemo(
    () =>
      !!selectedLocation &&
      !!selectedDateTime &&
      !!selectedModularTallyTemplate,
    [selectedDateTime, selectedLocation, selectedModularTallyTemplate],
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
            <ModularTallyTemplatesDataGrid
              selectedModularTallyTemplate={selectedModularTallyTemplate}
              onSelectModularTallyTemplate={(id) =>
                setSelectedModularTallyTemplate({ id })
              }
            />
          </>
        }
      </div>
    </CDialog>
  );
};

export default ModularTallyCreationDialog;
