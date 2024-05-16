"use client";

import { Tally } from "@prisma/client";

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
              {"Observador(a)"}
            </th>
          </tr>
        </thead>
        <tbody>
          {tallys.map((tally, key) => {
            return (
              <tr key={key}>
                <td style={{ border: "1px solid white", padding: "8px" }}>
                  {tally.startDate.getDate()}
                </td>
                <td style={{ border: "1px solid white", padding: "8px" }}>
                  {tally.startDate.getHours()}
                </td>
                <td style={{ border: "1px solid white", padding: "8px" }}>
                  {tally.observer}
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
