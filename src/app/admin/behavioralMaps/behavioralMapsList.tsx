"use client";

import CButton from "@/components/ui/cButton";
import CIconChip from "@/components/ui/cIconChip";
import { dateTimeFormatter } from "@/lib/formatters/dateFormatters";
import type { FetchBehavioralMapsResponse } from "@/lib/serverFunctions/queries/behavioralMap";
import { Chip, CircularProgress, Divider } from "@mui/material";
import {
  IconCalendar,
  IconClipboardList,
  IconExternalLink,
  IconUser,
} from "@tabler/icons-react";
import { Virtuoso } from "react-virtuoso";

type BehavioralMapRow = FetchBehavioralMapsResponse["behavioralMaps"][number];
const BehavioralMapsList = ({
  behavioralMaps,
  isLoadingMore,
  onNearScrollEnd,
}: {
  behavioralMaps: BehavioralMapRow[];
  isLoadingMore: boolean;
  onNearScrollEnd: () => void;
}) => (
  <div className="flex h-full flex-col gap-1">
    {behavioralMaps.length === 0 && !isLoadingMore && (
      <div className="text-center text-xl font-semibold">
        Nenhum mapa comportamental encontrado.
      </div>
    )}
    <Virtuoso
      data={behavioralMaps}
      rangeChanged={({ endIndex }) => {
        if (endIndex >= behavioralMaps.length - 10) onNearScrollEnd();
      }}
      components={{
        Footer: () =>
          isLoadingMore ?
            <div className="flex justify-center py-2">
              <CircularProgress size={28} />
            </div>
          : null,
      }}
      style={{ height: "100%", overflowX: "hidden", minHeight: 300 }}
      itemContent={(_, map) => (
        <div className="pb-4" key={map.id}>
          <div className="flex flex-row justify-between bg-gray-200 p-2 px-2 shadow-xl">
            <div className="flex h-auto w-full flex-col gap-1">
              <span className="flex flex-wrap items-center break-all text-lg font-semibold sm:text-2xl">
                <CIconChip
                  icon={<IconClipboardList />}
                  tooltip="Mapa comportamental"
                />
                {`${map.location.name} - ${map.id}`}{" "}
                <Chip
                  sx={{ ml: 2 }}
                  color={map.isFinalized ? "secondary" : "warning"}
                  label={map.isFinalized ? "Finalizado" : "Em progresso"}
                />
              </span>
              <Divider />
              <span className="flex items-center text-base sm:text-xl">
                <CIconChip icon={<IconClipboardList />} tooltip="Protocolo" />
                {map.behavioralMapProtocol.name}
              </span>
              <Divider />
              <span className="flex items-center text-base sm:text-xl">
                <CIconChip
                  icon={<IconCalendar />}
                  tooltip={map.endDate ? "Início - Fim" : "Início"}
                />
                {`${dateTimeFormatter.format(map.startDate)} ${map.endDate ? `- ${dateTimeFormatter.format(map.endDate)}` : ""}`}
              </span>
              <Divider />
              <span className="flex items-center text-base sm:text-xl">
                <CIconChip icon={<IconUser />} tooltip="Responsável" />
                {map.user.username}
              </span>
              <Divider />
              <span className="flex items-center gap-2 text-base sm:text-xl">
                <CButton
                  square
                  loadingOnClick
                  href={`/admin/behavioralMap/details?behavioralMapId=${map.id}`}
                >
                  <IconExternalLink />
                  Acessar
                </CButton>
              </span>
            </div>
          </div>
        </div>
      )}
    />
  </div>
);
export default BehavioralMapsList;
