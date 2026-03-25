import { useUserContext } from "@/components/context/UserContext";
import CLinearProgress from "@/components/ui/CLinearProgress";
import AssessmentResultViewer from "@/components/ui/assessment/assessmentResultViewer";
import CCheckbox from "@/components/ui/cCheckbox";
import CIconChip from "@/components/ui/cIconChip";
import CSwitch from "@/components/ui/cSwtich";
import CDialog from "@/components/ui/dialog/cDialog";
import CLocationAdministrativeUnits from "@/components/ui/location/cLocationAdministrativeUnits";
import { useFetchAssessmentTree } from "@/lib/serverFunctions/apiCalls/assessment";
import { FetchAssessmentTreeResponse } from "@/lib/serverFunctions/queries/assessment";
import { FetchLocationsResponse } from "@/lib/serverFunctions/queries/location";
import { _updateLocationVisibility } from "@/lib/serverFunctions/serverActions/locationUtil";
import { useServerAction } from "@/lib/utils/useServerAction";
import { Divider } from "@mui/material";
import {
  IconCheck,
  IconCircleDashedLetterC,
  IconCircleDashedLetterT,
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
  const [pendingVisibility, setPendingVisibility] = useState<boolean | null>(
    null,
  );
  const [latestAssessment, setLatestAssessment] =
    useState<FetchAssessmentTreeResponse["assessmentTree"]>();

  const [fetchLatestAssessmentTree, fetchLatestAssessmentTreeLoading] =
    useFetchAssessmentTree({
      params: {
        callbacks: {
          onSuccess: (response) => {
            setLatestAssessment(response.data?.assessmentTree);
          },
        },
      },
    });

  const [updateLocationVisibility, updateLocationVisibilityLoading] =
    useServerAction({
      action: _updateLocationVisibility,
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
    setLatestAssessment(undefined);
    if (location.latestAssessmentId) {
      void fetchLatestAssessmentTree({
        assessmentId: String(location.latestAssessmentId),
      });
    } else {
      setLatestAssessment(undefined);
    }
  }, [location, fetchLatestAssessmentTree]);

  return (
    <div className="flex flex-col gap-1">
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
      <h4 className="font-semibold">Características Físicas</h4>
      <span>{`Área oficial (prefeitura): ${location.legalArea ? location.legalArea + " m²" : "(Não preenchido)"}`}</span>

      <span>{`Área útil: ${location.usableArea ? location.usableArea + " m²" : "(Não preenchido)"}`}</span>

      <span>{`Inclinação: ${location.incline ? location.incline + " %" : "(Não preenchido)"}`}</span>
      <Divider />
      <h4 className="font-semibold">Histórico</h4>
      <span>{`Ano de criação: ${location.creationYear ?? "(Não preenchido)"}`}</span>
      <span>{`Última manutenção: ${location.lastMaintenanceYear ?? "(Não preenchido)"}`}</span>
      <span>{`Legislação: ${location.legislation ?? "(Não preenchido)"}`}</span>
      <Divider />
      {fetchLatestAssessmentTreeLoading && (
        <CLinearProgress label="Carregando mais informações..." />
      )}
      {latestAssessment && (
        <>
          <AssessmentResultViewer assessment={latestAssessment} />
          <Divider />
        </>
      )}
      <h4 className="font-semibold">Observações gerais</h4>
      <div className="whitespace-pre-wrap">
        {location.notes ?? "(Não preenchido)"}
      </div>
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
            id: location.id,
            isPublic: pendingVisibility,
          });
        }}
      />
    </div>
  );
};

export default LocationInfo;
