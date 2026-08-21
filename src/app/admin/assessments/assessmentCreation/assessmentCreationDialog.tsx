import ConfirmDisabledOfflineSavingDialog from "@/app/admin/assessments/assessmentCreation/confirmDisabledOfflineSavingDialog";
import FormsDataGrid from "@/app/admin/assessments/assessmentCreation/formsDataGrid";
import { useUserContext } from "@/components/context/UserContext";
import LocationSelector from "@/components/locationSelector/locationSelector";
import CDateTimePicker from "@/components/ui/cDateTimePicker";
import CDialog from "@/components/ui/dialog/cDialog";
import { fetchAdminSQLiteIfCanSaveAssessment } from "@/lib/capacitor/sqlite/adminSQLiteDb/queries/assessment";
import { useCreateAssessment } from "@/lib/serverFunctions/apiCalls/assessment";
import { FetchLocationsResponse } from "@/lib/serverFunctions/queries/location";
import { Capacitor } from "@capacitor/core";
import { Divider, LinearProgress } from "@mui/material";
import { IconCheck } from "@tabler/icons-react";
import dayjs, { Dayjs } from "dayjs";
import { useRouter } from "next-nprogress-bar";
import { useMemo, useState } from "react";

const AssessmentCreationDialog = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const router = useRouter();
  const { user } = useUserContext();
  const [selectedLocation, setSelectedLocation] = useState<
    FetchLocationsResponse["locations"][number] | null
  >(null);

  const [selectedDateTime, setSelectedDateTime] = useState<Dayjs | null>(
    dayjs(new Date()).second(0).millisecond(0),
  );
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [selectedForm, setSelectedForm] = useState<{ id: number } | null>(null);

  const [
    openConfirmDisabledOfflineSavingDialog,
    setOpenConfirmDisabledOfflineSavingDialog,
  ] = useState(false);

  const [createAssessment, isSaving] = useCreateAssessment({
    callbacks: {
      onServerSuccess(response) {
        if (!response.data?.assessmentId) {
          return;
        }
        setIsRedirecting(true);
        router.push(
          `/admin/assessments/details?assessmentId=${response.data.assessmentId}`,
        );
      },
      onOfflineSuccess: (response) => {
        if (!response.data?.assessmentId) {
          return;
        }
        setIsRedirecting(true);
        router.push(
          `/admin/assessments/details?assessmentId=${response.data.assessmentId}&isSQLiteAssessment=${true}`,
        );
      },
    },
  });

  const submit = () => {
    if (!selectedLocation || !selectedDateTime || !selectedForm) return;
    const formData = new FormData();
    formData.append("locationId", selectedLocation.id.toString());
    formData.append("startDate", selectedDateTime.toDate().toISOString());
    formData.append("formId", selectedForm.id.toString());
    void createAssessment({ data: formData });
  };
  const handleSubmit = async () => {
    if (!selectedLocation || !selectedDateTime || !selectedForm) return;
    if (Capacitor.isNativePlatform()) {
      const checkIfCanSaveOffline = await fetchAdminSQLiteIfCanSaveAssessment({
        params: {
          formId: selectedForm.id,
          locationId: selectedLocation.id,
          userId: user.id,
        },
      });
      if (!checkIfCanSaveOffline.data?.canSave) {
        setOpenConfirmDisabledOfflineSavingDialog(true);
      } else {
        submit();
      }
    } else {
      submit();
    }
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
      onConfirm={() => {
        void handleSubmit();
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
      <ConfirmDisabledOfflineSavingDialog
        open={openConfirmDisabledOfflineSavingDialog}
        onClose={() => {
          setOpenConfirmDisabledOfflineSavingDialog(false);
        }}
        onConfirm={() => {
          setOpenConfirmDisabledOfflineSavingDialog(false);
          submit();
        }}
      />
    </CDialog>
  );
};

export default AssessmentCreationDialog;
