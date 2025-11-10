import { Chip } from "@mui/material";
import {
  IconCalendar,
  IconClipboard,
  IconEye,
  IconFountain,
  IconPencil,
  IconUser,
} from "@tabler/icons-react";

import CButton from "../../../components/ui/cButton";
import CIconChip from "../../../components/ui/cIconChip";
import { dateTimeFormatter } from "../../../lib/formatters/dateFormatters";
import { FetchAssessmentsResponse } from "../../../lib/serverFunctions/queries/assessment";

const AssessmentsList = ({
  assessments,
}: {
  assessments: FetchAssessmentsResponse["assessments"];
}) => {
  return (
    <div className="flex flex-col gap-1 overflow-auto">
      {assessments.length === 0 && (
        <div className="text-center text-xl font-semibold">
          Nenhuma avaliação corresponde aos filtros!
        </div>
      )}
      {assessments.map((a) => (
        <div
          key={a.id}
          className="flex flex-row justify-between rounded-3xl bg-main p-2 px-6 shadow-xl"
        >
          <div className="flex h-auto w-full flex-col gap-1">
            <span className="flex break-all text-2xl font-semibold">
              <CIconChip icon={<IconFountain />} tooltip="Praça" />
              {a.location.name}
            </span>
            <div className="flex w-full flex-wrap text-xl font-semibold">
              <div>Avaliação #{a.id} </div>

              <Chip
                color={a.endDate ? "secondary" : "error"}
                label={a.endDate ? "Finalizado" : "Em progresso"}
              />
            </div>
            <span className="flex text-xl">
              <CIconChip icon={<IconClipboard />} tooltip="Fomulário" />
              {a.form.name}
            </span>
            <span className="flex text-xl">
              <CIconChip
                icon={<IconCalendar />}
                tooltip={a.endDate ? "Data de início" : "Data de finalização"}
              />
              {`${dateTimeFormatter.format(new Date(a.startDate))} ${a.endDate ? `- ${dateTimeFormatter.format(new Date(a.endDate))}` : ""}`}
            </span>
            <span className="flex text-xl">
              <CIconChip icon={<IconUser />} tooltip="Responsável" />
              {a.user.username}
            </span>
          </div>
          <div className="flex flex-col">
            <CButton color="secondary">
              {a.endDate ?
                <IconEye />
              : <IconPencil />}
            </CButton>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssessmentsList;
