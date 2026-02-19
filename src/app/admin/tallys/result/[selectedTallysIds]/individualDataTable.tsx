"use client";

import CButton from "@/components/ui/cButton";
import { dateFormatter, hourFormatter } from "@formatters/dateFormatters";
import { IconPencil } from "@tabler/icons-react";
import { FinalizedTally } from "@zodValidators";
import { useRouter } from "next-nprogress-bar";

const formatName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  return parts.length > 2 ?
      `${parts[0]?.trim()} ${parts[parts.length - 1]?.trim()}`
    : fullName;
};

const weatherConditionsMap = new Map([
  ["CLOUDY", "Nublado"],
  ["SUNNY", "Ensolarado"],
]);

const IndividualDataTable = ({ tallys }: { tallys: FinalizedTally[] }) => {
  const router = useRouter();
  const navigateToTallyFillingPage = (tallyId: number) => {
    router.push(`/admin/tallys/${tallyId}/fill`);
  };
  return (
    <>
      <div className="flex flex-col gap-5 overflow-auto rounded">
        {tallys.map((tally, key) => (
          <div
            key={key}
            className="rounded border border-black p-4 xl:border-gray-300 xl:shadow-sm"
          >
            <p>
              <strong>{"Data: "}</strong>
              {dateFormatter.format(tally.startDate.getTime())}
            </p>
            <p>
              <strong>{"Horário: "}</strong>
              {hourFormatter.format(tally.startDate.getTime())}
            </p>
            <p>
              <strong>{"Duração(mm:ss): "}</strong>
              {tally.endDate ?
                `${String(
                  Math.floor(
                    (tally.endDate?.getTime() - tally.startDate.getTime()) /
                      (1000 * 60 * 60),
                  ),
                ).padStart(2, "0")}:${String(
                  Math.floor(
                    ((tally.endDate?.getTime() - tally.startDate.getTime()) %
                      (1000 * 60 * 60)) /
                      (1000 * 60),
                  ),
                ).padStart(2, "0")}`
              : "Em andamento"}
            </p>
            <p>
              <strong>{"Observador(a): "}</strong>
              {formatName(tally.user.username ?? "")}
            </p>
            <p>
              <strong>{"Temperatura: "}</strong>
              {tally.temperature}°C
            </p>
            <p>
              <strong>{"Condição climática: "}</strong>
              {tally.weatherCondition ?
                weatherConditionsMap.get(tally.weatherCondition)
              : ""}
            </p>
            <span className="flex flex-wrap items-center">
              <span className="w-fit">
                <strong>{"Editar contagem: "}</strong>
              </span>
              <CButton
                square
                className="ml-2 w-fit"
                onClick={() => {
                  navigateToTallyFillingPage(tally.id);
                }}
              >
                <IconPencil />
              </CButton>
            </span>
          </div>
        ))}
      </div>
    </>
  );
};

export { IndividualDataTable };
