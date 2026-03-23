import CButton from "@/components/ui/cButton";
import CSwitch from "@/components/ui/cSwtich";
import CDialog from "@/components/ui/dialog/cDialog";
import { _updateAssessmentVisibility } from "@/lib/serverFunctions/serverActions/assessmentUtil";
import { useServerAction } from "@/lib/utils/useServerAction";
import { Chip, Divider } from "@mui/material";
import {
  IconCalendar,
  IconCheck,
  IconClipboard,
  IconExternalLink,
  IconFilePencil,
  IconUser,
} from "@tabler/icons-react";
import { useState } from "react";
import { Virtuoso } from "react-virtuoso";

import CIconChip from "../../../components/ui/cIconChip";
import { dateTimeFormatter } from "../../../lib/formatters/dateFormatters";
import { FetchAssessmentsResponse } from "../../../lib/serverFunctions/queries/assessment";

const AssessmentsList = ({
  assessments,
  handleVisibilityChange,
}: {
  assessments: FetchAssessmentsResponse["assessments"];
  handleVisibilityChange: (id: number, isPublic: boolean) => void;
}) => {
  const [pendingVisibilityChange, setPendingVisibilityChange] = useState<{
    id: number;
    locationName: string;
    isPublic: boolean;
  }>();

  const [updateVisibility, updatingVisibility] = useServerAction({
    action: _updateAssessmentVisibility,
    callbacks: {
      onSuccess: () => {
        if (pendingVisibilityChange === undefined) {
          return;
        }

        handleVisibilityChange(
          pendingVisibilityChange.id,
          pendingVisibilityChange.isPublic,
        );
        setPendingVisibilityChange(undefined);
      },
      onError: () => {
        setPendingVisibilityChange(undefined);
      },
    },
  });
  return (
    <div className="flex h-full flex-col gap-1">
      {assessments.length === 0 && (
        <div className="text-center text-xl font-semibold">
          Nenhuma avaliação corresponde aos filtros!
        </div>
      )}
      <Virtuoso
        data={assessments}
        style={{ height: "100%", overflowX: "hidden", minHeight: "300px" }}
        itemContent={(_, a) => {
          return (
            <div className="pb-4">
              <div
                key={a.id}
                className="flex flex-row justify-between bg-gray-200 p-2 px-2 shadow-xl"
              >
                <div className="flex h-auto w-full flex-col gap-1">
                  <span className="flex flex-wrap items-center break-all text-lg font-semibold sm:text-2xl">
                    <CIconChip
                      icon={<IconFilePencil />}
                      tooltip="Praça - Avaliação"
                    />
                    {`${a.location.name} - ${a.id} `}
                    <Chip
                      sx={{ ml: 2 }}
                      color={a.endDate ? "secondary" : "error"}
                      label={a.endDate ? "Finalizado" : "Em progresso"}
                    />
                  </span>
                  <Divider />
                  <span className="flex items-center text-base sm:text-xl">
                    <CIconChip icon={<IconClipboard />} tooltip="Fomulário" />
                    {a.form.name}
                  </span>
                  <Divider />
                  <span className="flex items-center text-base sm:text-xl">
                    <CIconChip
                      icon={<IconCalendar />}
                      tooltip={a.endDate ? "Início - Fim" : "Início"}
                    />
                    {`${dateTimeFormatter.format(new Date(a.startDate))} ${a.endDate ? `- ${dateTimeFormatter.format(new Date(a.endDate))}` : ""}`}
                  </span>
                  <Divider />
                  <span className="flex items-center text-base sm:text-xl">
                    <CIconChip icon={<IconUser />} tooltip="Responsável" />
                    {a.user.username}
                  </span>
                  <Divider />
                  <span className="flex items-center gap-2 text-base sm:text-xl">
                    <CButton
                      square
                      loadingOnClick
                      href={`/admin/assessments/${a.id}`}
                    >
                      <IconExternalLink />
                      Acessar
                    </CButton>
                    <Divider orientation="vertical" />
                    <CSwitch
                      checked={
                        pendingVisibilityChange?.id === a.id ?
                          pendingVisibilityChange.isPublic
                        : a.isPublic
                      }
                      label="Visível publicamente"
                      onChange={(e) => {
                        setPendingVisibilityChange({
                          id: a.id,
                          locationName: a.location.name,
                          isPublic: e.target.checked,
                        });
                      }}
                    />
                  </span>
                </div>
              </div>
            </div>
          );
        }}
      />
      <CDialog
        title="Alterar visibilidade"
        open={!!pendingVisibilityChange}
        onClose={() => {
          setPendingVisibilityChange(undefined);
        }}
        confirmChildren={<IconCheck />}
        confirmLoading={updatingVisibility}
        onConfirm={() => {
          void updateVisibility({
            assessmentId: pendingVisibilityChange!.id,
            isPublic: pendingVisibilityChange!.isPublic,
          });
        }}
      >
        <div>
          {pendingVisibilityChange?.isPublic ?
            "Deixar esta avaliação visível publicamente?"
          : "Ocultar publicamente esta avaliação?"}
        </div>
        <div className="font-semibold">{`${pendingVisibilityChange?.locationName} - ${pendingVisibilityChange?.id}`}</div>
      </CDialog>
    </div>
  );
};

export default AssessmentsList;
