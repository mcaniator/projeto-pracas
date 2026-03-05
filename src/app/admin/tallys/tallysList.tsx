import { useUserContext } from "@/components/context/UserContext";
import CButton from "@/components/ui/cButton";
import CSwitch from "@/components/ui/cSwtich";
import CDialog from "@/components/ui/dialog/cDialog";
import { FetchTallysResponse } from "@/lib/serverFunctions/queries/tally";
import { _updateTallyVisibility } from "@/lib/serverFunctions/serverActions/tallyUtil";
import { useServerAction } from "@/lib/utils/useServerAction";
import { Chip, Divider } from "@mui/material";
import {
  IconCalendar,
  IconCheck,
  IconExternalLink,
  IconFilePencil,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Virtuoso } from "react-virtuoso";

import CIconChip from "../../../components/ui/cIconChip";
import { dateTimeFormatter } from "../../../lib/formatters/dateFormatters";

const TallysList = ({ tallys }: { tallys: FetchTallysResponse["tallys"] }) => {
  const { user } = useUserContext();
  const [openVisibilityDialog, setOpenVisibilityDialog] = useState(false);
  const [selectedTallyId, setSelectedTallyId] = useState<number | null>(null);
  const [pendingVisibility, setPendingVisibility] = useState<boolean | null>(
    null,
  );
  const [visibilityById, setVisibilityById] = useState<Record<number, boolean>>(
    {},
  );

  const [updateTallyVisibility, updateTallyVisibilityLoading] = useServerAction(
    {
      action: _updateTallyVisibility,
      callbacks: {
        onSuccess: () => {
          if (selectedTallyId === null || pendingVisibility === null) {
            return;
          }
          setVisibilityById((prev) => ({
            ...prev,
            [selectedTallyId]: pendingVisibility,
          }));
          setSelectedTallyId(null);
          setPendingVisibility(null);
          setOpenVisibilityDialog(false);
        },
        onError: () => {
          setSelectedTallyId(null);
          setPendingVisibility(null);
          setOpenVisibilityDialog(false);
        },
      },
    },
  );

  useEffect(() => {
    const nextVisibilityById = tallys.reduce<Record<number, boolean>>(
      (acc, tally) => {
        acc[tally.id] = tally.isPublic;
        return acc;
      },
      {},
    );
    setVisibilityById(nextVisibilityById);
    setSelectedTallyId(null);
    setPendingVisibility(null);
    setOpenVisibilityDialog(false);
  }, [tallys]);

  return (
    <div className="flex h-full flex-col gap-1">
      {tallys.length === 0 && (
        <div className="text-center text-xl font-semibold">
          Nenhuma contagem corresponde aos filtros!
        </div>
      )}
      <Virtuoso
        data={tallys}
        style={{ height: "100%", overflowX: "hidden", minHeight: "300px" }}
        itemContent={(_, a) => {
          return (
            <div className="pb-4" key={a.id}>
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
                      tooltip="Navegar"
                      loadingOnClick
                      href={
                        a.endDate ?
                          `/admin/tallys/result/${a.id}`
                        : `/admin/tallys/${a.id}/fill`
                      }
                    >
                      <IconExternalLink />
                      Acessar
                    </CButton>
                    <Divider orientation="vertical" />
                    <CSwitch
                      checked={
                        selectedTallyId === a.id && pendingVisibility !== null ?
                          pendingVisibility
                        : (visibilityById[a.id] ?? a.isPublic)
                      }
                      label="Visiblidade pública"
                      onChange={(_, checked) => {
                        setSelectedTallyId(a.id);
                        setPendingVisibility(checked);
                        setOpenVisibilityDialog(true);
                      }}
                      disabled={!user.roles.includes("TALLY_MANAGER")}
                      formControlSx={{
                        "& .MuiFormControlLabel-label": {
                          color: "black",
                        },
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
        open={openVisibilityDialog}
        onClose={() => {
          if (updateTallyVisibilityLoading) {
            return;
          }
          setSelectedTallyId(null);
          setPendingVisibility(null);
          setOpenVisibilityDialog(false);
        }}
        title="Alterar visibilidade"
        subtitle={
          pendingVisibility ?
            "Deseja que esta contagem seja visível publicamente?"
          : "Deseja que esta contagem deixe de ser visível publicamente?"
        }
        confirmLoading={updateTallyVisibilityLoading}
        confirmChildren={<IconCheck />}
        cancelChildren={<IconX />}
        cancelVariant="outlined"
        onCancel={() => {
          if (updateTallyVisibilityLoading) {
            return;
          }
          setSelectedTallyId(null);
          setPendingVisibility(null);
          setOpenVisibilityDialog(false);
        }}
        onConfirm={() => {
          if (selectedTallyId === null || pendingVisibility === null) {
            return;
          }
          void updateTallyVisibility({
            id: selectedTallyId,
            isPublic: pendingVisibility,
          });
        }}
      />
    </div>
  );
};

export default TallysList;
