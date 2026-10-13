import { useUserContext } from "@/components/context/UserContext";
import CLinearProgress from "@/components/ui/CLinearProgress";
import CButton from "@/components/ui/cButton";
import CCheckbox from "@/components/ui/cCheckbox";
import CIconChip from "@/components/ui/cIconChip";
import CSwitch from "@/components/ui/cSwtich";
import CDialog from "@/components/ui/dialog/cDialog";
import ResponseFormV2 from "@/components/ui/responseForm/responseFormV2";
import CLocationAdministrativeUnits from "@/components/ui/location/cLocationAdministrativeUnits";
import {
  useFetchLocationFormSubmission,
  useUpdateLocationVisibility,
} from "@/lib/serverFunctions/apiCalls/location";
import { FetchLocationsResponse } from "@/lib/serverFunctions/queries/location";
import { FetchLocationFormSubmissionResponse } from "@/lib/serverFunctions/queries/location";
import { Divider } from "@mui/material";
import {
  IconCheck,
  IconCircleDashedLetterC,
  IconCircleDashedLetterT,
  IconExternalLink,
  IconRoad,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

const LocationInfo = ({
  location,
  reloadLocations,
}: {
  location: FetchLocationsResponse["locations"][number];
  reloadLocations: () => void;
}) => {
  const { user } = useUserContext();

  const [openVisibilityDialog, setOpenVisibilityDialog] = useState(false);
  const [openLocationFormDialog, setOpenLocationFormDialog] = useState(false);
  const [pendingVisibility, setPendingVisibility] = useState<boolean | null>(
    null,
  );
  const [locationFormSubmission, setLocationFormSubmission] =
    useState<FetchLocationFormSubmissionResponse | null>(null);

  const [fetchLocationFormSubmission, fetchLocationFormSubmissionLoading] =
    useFetchLocationFormSubmission({
      callbacks: {
        onSuccess: (response) => {
          setLocationFormSubmission(response.data ?? null);
        },
      },
  });

  const [updateLocationVisibility, updateLocationVisibilityLoading] =
    useUpdateLocationVisibility({
      callbacks: {
        onSuccess: () => {
          if (pendingVisibility === null) {
            return;
          }
          setPendingVisibility(null);
          setOpenVisibilityDialog(false);
          reloadLocations();
        },
        onError: () => {
          setPendingVisibility(null);
          setOpenVisibilityDialog(false);
        },
      },
    });

  useEffect(() => {
    setPendingVisibility(null);
    setOpenVisibilityDialog(false);
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

  return (
    <div className="flex flex-col gap-1 pr-2">
      <h4 className="font-semibold">Visibilidade</h4>
      <CSwitch
        label="Visibilidade pública"
        checked={
          pendingVisibility !== null ? pendingVisibility : location.isPublic
        }
        onChange={(_, checked) => {
          setPendingVisibility(checked);
          setOpenVisibilityDialog(true);
        }}
        disabled={!user.roles.includes("PARK_MANAGER")}
      />
      <Divider />
      <h4 className="font-semibold">Situação cadastral</h4>
      <CCheckbox checked={location.isPark} label="É praça" disabled />
      <CCheckbox
        checked={location.inactiveNotFound}
        label="Inativo ou não encontrado"
        disabled
      />
      <Divider />
      <h4 className="font-semibold">Localização</h4>
      <CLocationAdministrativeUnits location={location} variant="emphasis" />

      <div className="flex items-center">
        <CIconChip icon={<IconRoad />} tooltip="Ruas" variant="emphasis" />
        {[
          location.firstStreet,
          location.secondStreet,
          location.thirdStreet,
          location.fourthStreet,
        ]
          .filter(Boolean)
          .join(", ")}
      </div>
      <Divider />
      <h4 className="font-semibold">Categorização</h4>
      <span>
        <CIconChip
          icon={<IconCircleDashedLetterT />}
          tooltip="Tipo"
          variant={location.typeName ? "emphasis" : "disabled"}
        />
        {location.typeName ?? "(Não preenchido)"}
      </span>
      <span>
        <CIconChip
          icon={<IconCircleDashedLetterC />}
          tooltip="Categoria"
          variant={location.categoryName ? "emphasis" : "disabled"}
        />
        {location.categoryName ?? "(Não preenchido)"}
      </span>
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
      <CDialog
        open={openVisibilityDialog}
        onClose={() => {
          if (updateLocationVisibilityLoading) {
            return;
          }
          setPendingVisibility(null);
          setOpenVisibilityDialog(false);
        }}
        title="Alterar visibilidade"
        subtitle={
          pendingVisibility === null ? ""
          : pendingVisibility ?
            "Deseja que esta praça seja visível publicamente?"
          : "Deseja que esta praça deixe de ser visível publicamente?"
        }
        confirmLoading={updateLocationVisibilityLoading}
        confirmChildren={<IconCheck />}
        cancelChildren={<IconX />}
        cancelVariant="outlined"
        onCancel={() => {
          if (updateLocationVisibilityLoading) {
            return;
          }
          setPendingVisibility(null);
          setOpenVisibilityDialog(false);
        }}
        onConfirm={() => {
          if (pendingVisibility === null) {
            return;
          }
          void updateLocationVisibility({
            data: {
              id: location.id,
              isPublic: pendingVisibility,
            },
          });
        }}
      />
    </div>
  );
};

export default LocationInfo;
