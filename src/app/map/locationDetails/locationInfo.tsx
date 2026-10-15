import CLinearProgress from "@/components/ui/CLinearProgress";
import CButton from "@/components/ui/cButton";
import CCheckbox from "@/components/ui/cCheckbox";
import CIconChip from "@/components/ui/cIconChip";
import CDialog from "@/components/ui/dialog/cDialog";
import FormSubmissionViewer from "@/components/ui/formSubmissionViewer/formSubmissionViewer";
import CLocationAdministrativeUnits from "@/components/ui/location/cLocationAdministrativeUnits";
import ResponseFormV2 from "@/components/ui/responseForm/responseFormV2";
import { usePublicFetchLocationFormSubmission } from "@/lib/serverFunctions/apiCalls/public/location";
import { usePublicFetchPublicAssessmentDetails } from "@/lib/serverFunctions/apiCalls/public/assessment";
import { PublicFetchPublicAssessmentDetailsResponse } from "@/lib/serverFunctions/queries/public/assessment";
import {
  PublicFetchLocationFormSubmissionResponse,
  PublicFetchLocationsResponse,
} from "@/lib/serverFunctions/queries/public/location";
import { Divider } from "@mui/material";
import {
  IconCircleDashedLetterC,
  IconCircleDashedLetterT,
  IconExternalLink,
  IconRoad,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

const LocationInfo = ({
  location,
}: {
  location: PublicFetchLocationsResponse["locations"][number];
}) => {
  const [latestAssessment, setLatestAssessment] =
    useState<PublicFetchPublicAssessmentDetailsResponse["assessmentDetails"]>();

  const [fetchLatestAssessmentDetails, fetchLatestAssessmentDetailsLoading] =
    usePublicFetchPublicAssessmentDetails({
      params: {
        callbacks: {
          onSuccess: (response) => {
            setLatestAssessment(response.data?.assessmentDetails);
          },
        },
      },
    });

  const [openLocationFormDialog, setOpenLocationFormDialog] = useState(false);

  const [locationFormSubmission, setLocationFormSubmission] =
    useState<PublicFetchLocationFormSubmissionResponse | null>(null);

  const [
    fetchLocationFormSubmission,
    fetchLocationFormSubmissionLoading,
  ] = usePublicFetchLocationFormSubmission({
    callbacks: {
      onSuccess: (response) => {
        setLocationFormSubmission(response.data ?? null);
      },
    },
  });

  useEffect(() => {
    setOpenLocationFormDialog(false);
    setLocationFormSubmission(null);

    if (location.formSubmissionId) {
      void fetchLocationFormSubmission({
        params: {
          formSubmissionId: location.formSubmissionId,
        },
      });
    }
  }, [location, fetchLocationFormSubmission]);

  useEffect(() => {
    setLatestAssessment(undefined);
    if (location.latestAssessmentId) {
      void fetchLatestAssessmentDetails({
        params: {
          assessmentId: location.latestAssessmentId,
        },
      });
    } else {
      setLatestAssessment(undefined);
    }
  }, [location, fetchLatestAssessmentDetails]);

  return (
    <div className="flex flex-col gap-1 pr-2">
      <h4 className="font-semibold">Localização</h4>
      <CLocationAdministrativeUnits location={location} />

      <div className="flex items-center">
        <CIconChip icon={<IconRoad />} tooltip="Ruas" />
        {[
          location.firstStreet,
          location.secondStreet,
          location.thirdStreet,
          location.fourthStreet,
        ]
          .filter(Boolean)
          .join(", ")}
      </div>
      {(location.categoryName || location.typeName) && (
        <>
          <Divider />
          <h4 className="font-semibold">Categorização</h4>
          {location.typeName && (
            <span>
              <CIconChip icon={<IconCircleDashedLetterT />} tooltip="Tipo" />
              {location.typeName}
            </span>
          )}
          {location.categoryName && (
            <span>
              <CIconChip
                icon={<IconCircleDashedLetterC />}
                tooltip="Categoria"
              />
              {location.categoryName}
            </span>
          )}
        </>
      )}
      <Divider />
      {fetchLatestAssessmentDetailsLoading && (
        <CLinearProgress label="Carregando mais informações..." />
      )}
      {latestAssessment && (
        <>
          <FormSubmissionViewer
            formSubmission={{
              formStructure: latestAssessment.formSubmission.formStructure,
              responsesFormValues:
                latestAssessment.formSubmission.responsesFormValues,
              geometries: latestAssessment.formSubmission.geometries,
            }}
            locationPolygonGeoJson={latestAssessment.location.st_asgeojson}
          />
          <Divider />
        </>
      )}
      <h4 className="font-semibold">Situação cadastral</h4>
      <CCheckbox checked={location.isPark} label="É praça" disabled />
      <CCheckbox
        checked={location.inactiveNotFound}
        label="Inativo ou não encontrado"
        disabled
      />
      <Divider />
      <h4 className="font-semibold">Formulário de cadastro</h4>
      {fetchLocationFormSubmissionLoading && (
        <CLinearProgress label="Carregando formulário..." />
      )}
      {locationFormSubmission && (
        <div className="flex items-center justify-between rounded border border-gray-300 bg-gray-50 p-2">
          <div className="flex min-w-0 flex-col">
              <span className="truncate font-medium">
                {locationFormSubmission.formStructure.formName}
              </span>
              <span className="text-sm text-gray-600">
                Visualização do cadastro da praça
              </span>
          </div>
          <CButton
            square
            dense
            variant="outlined"
            tooltip="Visualizar formulário de cadastro"
            aria-label="Visualizar formulário de cadastro"
            onClick={() => {
              setOpenLocationFormDialog(true);
            }}
          >
            <IconExternalLink />
          </CButton>
        </div>
      )}
      {!fetchLocationFormSubmissionLoading &&
        !locationFormSubmission &&
        !location.formSubmissionId && (
          <span className="text-sm text-gray-600">
            Nenhum formulário de cadastro preenchido.
          </span>
        )}
      <CDialog
        open={openLocationFormDialog}
        title={locationFormSubmission?.formStructure.formName ?? "Formulário de cadastro"}
        subtitle="Visualização somente leitura"
        fullScreen
        disableDialogActions
        disableContentPadding
        onClose={() => {
          setOpenLocationFormDialog(false);
        }}
      >
        {locationFormSubmission && (
          <div className="flex h-full min-h-0 flex-col">
            <ResponseFormV2
              formSubmission={locationFormSubmission}
              readOnly
              locationPolygonGeoJson={location.st_asgeojson}
            />
          </div>
        )}
      </CDialog>
    </div>
  );
};

export default LocationInfo;
