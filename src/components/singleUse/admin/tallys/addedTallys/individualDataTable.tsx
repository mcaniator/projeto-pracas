"use client";

import { Tally } from "@prisma/client";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});
const hourFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  hour: "2-digit",
  minute: "2-digit",
});

const formatName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  return parts.length > 2 ?
      `${parts[0]?.trim()} ${parts[parts.length - 1]?.trim()}`
    : fullName;
};
const IndividualDataTable = ({ tallys }: { tallys: Tally[] }) => {
  return (
    <div>
      <table style={{ borderCollapse: "collapse", border: "1px solid white" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid white", padding: "0.5rem" }}>
              Data
            </th>
            <th style={{ border: "1px solid white", padding: "0.5rem" }}>
              Horário
            </th>
            <th style={{ border: "1px solid white", padding: "0.5rem" }}>
              Duração
            </th>
            <th style={{ border: "1px solid white", padding: "0.5rem" }}>
              {"Observador(a)"}
            </th>
          </tr>
        </thead>
        <tbody>
          {tallys.map((tally, key) => {
            return (
              <tr key={key}>
                <td style={{ border: "1px solid white", padding: "8px" }}>
                  {dateFormatter.format(tally.startDate.getTime())}
                </td>
                <td style={{ border: "1px solid white", padding: "8px" }}>
                  {hourFormatter.format(tally.startDate.getTime())}
                </td>
                <td style={{ border: "1px solid white", padding: "8px" }}>
                  {tally.endDate ?
                    `${String(Math.floor((tally.endDate?.getTime() - tally.startDate.getTime()) / (1000 * 60 * 60))).padStart(2, "0")}:${String(Math.floor(((tally.endDate?.getTime() - tally.startDate.getTime()) % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, "0")}`
                  : "Em andamento"}
                </td>
                <td style={{ border: "1px solid white", padding: "8px" }}>
                  {formatName(tally.observer)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export { IndividualDataTable };
