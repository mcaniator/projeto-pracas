import CButton from "@/components/ui/cButton";
import CIconChip from "@/components/ui/cIconChip";
import { dateTimeFormatter } from "@/lib/formatters/dateFormatters";
import type { FetchModularTallysResponse } from "@/lib/serverFunctions/queries/modularTally";
import { Chip, Divider } from "@mui/material";
import {
  IconCalendar,
  IconClipboardList,
  IconExternalLink,
  IconFilePencil,
  IconUser,
} from "@tabler/icons-react";
import { Virtuoso } from "react-virtuoso";

const ModularTallysList = ({
  modularTallys,
}: {
  modularTallys: FetchModularTallysResponse["modularTallys"];
}) => {
  return (
    <div className="flex h-full flex-col gap-1">
      {modularTallys.length === 0 && (
        <div className="text-center text-xl font-semibold">
          Nenhuma contagem corresponde aos filtros!
        </div>
      )}
      <Virtuoso
        data={modularTallys}
        style={{ height: "100%", overflowX: "hidden", minHeight: "300px" }}
        itemContent={(_, modularTally) => (
          <div className="pb-4" key={modularTally.id}>
            <div className="flex flex-row justify-between bg-gray-200 p-2 px-2 shadow-xl">
              <div className="flex h-auto w-full flex-col gap-1">
                <span className="flex flex-wrap items-center break-all text-lg font-semibold sm:text-2xl">
                  <CIconChip
                    icon={<IconFilePencil />}
                    tooltip="Praça - Contagem"
                  />
                  {`${modularTally.location.name} - ${modularTally.id} `}
                  <Chip
                    sx={{ ml: 2 }}
                    color={modularTally.isFinalized ? "secondary" : "warning"}
                    label={
                      modularTally.isFinalized ? "Finalizado" : "Em progresso"
                    }
                  />
                </span>
                <Divider />
                <span className="flex items-center text-base sm:text-xl">
                  <CIconChip
                    icon={<IconClipboardList />}
                    tooltip="Protocolo de contagem"
                  />
                  {modularTally.modularTallyTemplate.name}
                </span>
                <Divider />
                <span className="flex items-center text-base sm:text-xl">
                  <CIconChip
                    icon={<IconCalendar />}
                    tooltip={modularTally.endDate ? "Início - Fim" : "Início"}
                  />
                  {`${dateTimeFormatter.format(modularTally.startDate)} ${modularTally.endDate ? `- ${dateTimeFormatter.format(modularTally.endDate)}` : ""}`}
                </span>
                <Divider />
                <span className="flex items-center text-base sm:text-xl">
                  <CIconChip icon={<IconUser />} tooltip="Responsável" />
                  {modularTally.user.username}
                </span>
                <Divider />
                <span className="flex items-center gap-2 text-base sm:text-xl">
                  <CButton
                    square
                    disabled
                    tooltip="A tela da contagem será implementada em breve."
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
};

export default ModularTallysList;
