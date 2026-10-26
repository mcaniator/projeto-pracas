"use client";

import TallyResultDialog from "@/app/admin/tallys/tallyResultDialog";
import CButton from "@/components/ui/cButton";
import CIconChip from "@/components/ui/cIconChip";
import { dateTimeFormatter } from "@/lib/formatters/dateFormatters";
import { Chip, CircularProgress, Divider } from "@mui/material";
import {
  IconCalendar,
  IconClipboardList,
  IconDeviceFloppy,
  IconExternalLink,
  IconEye,
  IconFilePencil,
  IconUser,
} from "@tabler/icons-react";
import { useState } from "react";
import { Virtuoso } from "react-virtuoso";

import type { TallyWithSyncStatus } from "./tallysClient";

const TallysList = ({
  tallys,
  isLoadingMore,
  onNearScrollEnd,
}: {
  tallys: TallyWithSyncStatus[];
  isLoadingMore: boolean;
  onNearScrollEnd: () => void;
}) => {
  const [selectedTallyToView, setSelectedTallyToView] =
    useState<TallyWithSyncStatus | null>(null);

  return (
    <div className="flex h-full flex-col gap-1">
      {tallys.length === 0 && !isLoadingMore && (
        <div className="text-center text-xl font-semibold">
          Nenhuma contagem corresponde aos filtros!
        </div>
      )}
      <Virtuoso
        data={tallys}
        rangeChanged={({ endIndex }) => {
          if (endIndex >= tallys.length - 10) {
            onNearScrollEnd();
          }
        }}
        components={{
          Footer: () =>
            isLoadingMore ?
              <div className="flex justify-center py-2">
                <CircularProgress size={28} />
              </div>
            : null,
        }}
        style={{ height: "100%", overflowX: "hidden", minHeight: "300px" }}
        itemContent={(_, tally) => (
          <div className="pb-4" key={tally.id}>
            <div className="flex flex-row justify-between bg-gray-200 p-2 px-2 shadow-xl">
              <div className="flex h-auto w-full flex-col gap-1">
                <span className="flex flex-wrap items-center break-all text-lg font-semibold sm:text-2xl">
                  <CIconChip
                    icon={<IconFilePencil />}
                    tooltip="Praça - Contagem"
                  />
                  {`${tally.location.name} - ${tally.id} `}
                  <Chip
                    sx={{ ml: 2 }}
                    color={tally.isFinalized ? "secondary" : "warning"}
                    label={
                      tally.isFinalized ? "Finalizado" : "Em progresso"
                    }
                  />
                </span>
                <Divider />
                {tally.hasPendingSaveFromDraft && (
                  <>
                    <span className="flex items-center text-base sm:text-xl">
                      <Chip
                        icon={<IconDeviceFloppy />}
                        label="Contagem não salva!"
                        color="error"
                      />
                    </span>
                    <Divider />
                  </>
                )}
                <span className="flex items-center text-base sm:text-xl">
                  <CIconChip
                    icon={<IconClipboardList />}
                    tooltip="Protocolo de contagem"
                  />
                  {tally.tallyProtocol.name}
                </span>
                <Divider />
                <span className="flex items-center text-base sm:text-xl">
                  <CIconChip
                    icon={<IconCalendar />}
                    tooltip={tally.endDate ? "Início - Fim" : "Início"}
                  />
                  {`${dateTimeFormatter.format(tally.startDate)} ${tally.endDate ? `- ${dateTimeFormatter.format(tally.endDate)}` : ""}`}
                </span>
                <Divider />
                <span className="flex items-center text-base sm:text-xl">
                  <CIconChip icon={<IconUser />} tooltip="Responsável" />
                  {tally.user.username}
                </span>
                <Divider />
                <span className="flex items-center gap-2 text-base sm:text-xl">
                  {(
                    tally.isFinalized &&
                    !tally.hasPendingSaveFromDraft
                  ) ?
                    <CButton
                      square
                      onClick={() => {
                        setSelectedTallyToView(tally);
                      }}
                    >
                      <IconEye /> Resultados
                    </CButton>
                  : <CButton
                      square
                      loadingOnClick
                      href={`/admin/tallys/details?tallyId=${tally.id}`}
                    >
                      <IconExternalLink />
                      Acessar
                    </CButton>
                  }
                </span>
              </div>
            </div>
          </div>
        )}
      />
      <TallyResultDialog
        tally={selectedTallyToView}
        open={!!selectedTallyToView}
        onClose={() => setSelectedTallyToView(null)}
      />
    </div>
  );
};

export default TallysList;
