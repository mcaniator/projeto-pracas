import CLinearProgress from "@/components/ui/CLinearProgress";
import CCheckbox from "@/components/ui/cCheckbox";
import CIconChip from "@/components/ui/cIconChip";
import FormSubmissionViewer from "@/components/ui/formSubmissionViewer/formSubmissionViewer";
import CLocationAdministrativeUnits from "@/components/ui/location/cLocationAdministrativeUnits";
import { usePublicFetchPublicAssessmentDetails } from "@/lib/serverFunctions/apiCalls/public/assessment";
import { usePublicFetchLocationFormSubmission } from "@/lib/serverFunctions/apiCalls/public/location";
import { PublicFetchPublicAssessmentDetailsResponse } from "@/lib/serverFunctions/queries/public/assessment";
import {
  PublicFetchLocationFormSubmissionResponse,
  PublicFetchLocationsResponse,
} from "@/lib/serverFunctions/queries/public/location";
import { Divider } from "@mui/material";
import {
  IconCircleDashedLetterC,
  IconCircleDashedLetterT,
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

  const [locationFormSubmission, setLocationFormSubmission] =
    useState<PublicFetchLocationFormSubmissionResponse | null>(null);

  const [fetchLocationFormSubmission, fetchLocationFormSubmissionLoading] =
    usePublicFetchLocationFormSubmission({
      callbacks: {
        onSuccess: (response) => {
          setLocationFormSubmission(response.data ?? null);
        },
      },
    });

  useEffect(() => {
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
      <h4 className="font-semibold">Formulário de cadastro</h4>
      {fetchLocationFormSubmissionLoading && (
        <CLinearProgress label="Carregando formulário..." />
      )}
      {locationFormSubmission && (
        <FormSubmissionViewer
          formSubmission={locationFormSubmission}
          locationPolygonGeoJson={location.st_asgeojson}
        />
      )}
      {!fetchLocationFormSubmissionLoading &&
        !locationFormSubmission &&
        !location.formSubmissionId && (
          <span className="text-sm text-gray-600">
            Nenhum formulário de cadastro preenchido.
          </span>
      )}
      <Divider />
      <h4 className="font-semibold">Situação cadastral</h4>
      <CCheckbox checked={location.isPark} label="É praça" disabled />
      <CCheckbox
        checked={location.inactiveNotFound}
        label="Inativo ou não encontrado"
        disabled
      />
      <Divider />
      <h4 className="font-semibold">Formulário de avaliação</h4>
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
    </div>
  );
};

export default LocationInfo;
