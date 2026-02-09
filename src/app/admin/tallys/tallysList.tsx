import { FetchTallysResponse } from "@/lib/serverFunctions/queries/tally";
import { Chip, Divider } from "@mui/material";
import { IconCalendar, IconFilePencil, IconUser } from "@tabler/icons-react";
import Link from "next/link";
import { Virtuoso } from "react-virtuoso";

import CIconChip from "../../../components/ui/cIconChip";
import { dateTimeFormatter } from "../../../lib/formatters/dateFormatters";

const TallysList = ({ tallys }: { tallys: FetchTallysResponse["tallys"] }) => {
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
            <Link
              key={a.id}
              href={
                a.endDate ?
                  `/admin/tallys/result/${a.id}`
                : `/admin/tallys/${a.id}/fill`
              }
            >
              <div className="pb-4">
                <div
                  key={a.id}
                  className="flex flex-row justify-between bg-gray-200 p-2 px-2 shadow-xl hover:scale-[1.02]"
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
                  </div>
                </div>
              </div>
            </Link>
          );
        }}
      />
    </div>
  );
};

export default TallysList;
