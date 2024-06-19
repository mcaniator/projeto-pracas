"use client";

import { TallyInfoAndCommercialActivitiesObject } from "./complementaryDataVisualization";

const CommercialActivitiesTable = ({
  tallyWithCommercialActivities,
  sortedCommercialActivitiesNames,
  totalCommercialActivities,
  sortedOccurrences,
}: {
  tallyWithCommercialActivities: Map<
    number,
    TallyInfoAndCommercialActivitiesObject
  >;
  sortedCommercialActivitiesNames: string[];
  totalCommercialActivities: number;
  sortedOccurrences: number[];
}) => {
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th
              style={{ border: "1px solid white", padding: "0.5rem" }}
              colSpan={
                sortedCommercialActivitiesNames.length ?
                  sortedCommercialActivitiesNames.length + 1
                : 2
              }
            >
              Atividades comerciais itinerantes
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: "1px solid white", padding: "0.5rem" }}>
              Total
            </td>
            <td
              style={{
                border: "1px solid white",
                padding: "0.5rem",
                textAlign: "center",
              }}
              colSpan={sortedCommercialActivitiesNames.length}
            >
              {totalCommercialActivities}
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid white", padding: "0.5rem" }}>
              Tipos
            </td>
            {sortedCommercialActivitiesNames.length ?
              sortedCommercialActivitiesNames.map((commercialActivity, key) => {
                return (
                  <td
                    key={key}
                    style={{
                      border: "1px solid white",
                      padding: "0.5rem",
                      textAlign: "center",
                    }}
                  >
                    {commercialActivity}
                  </td>
                );
              })
            : <td
                style={{
                  border: "1px solid white",
                  padding: "0.5rem",
                  textAlign: "center",
                }}
              >
                -
              </td>
            }
          </tr>
          <tr>
            <td style={{ border: "1px solid white", padding: "0.5rem" }}>
              Total por tipo
            </td>
            {sortedOccurrences.length ?
              sortedOccurrences.map((occurrences, key) => {
                return (
                  <td
                    key={key}
                    style={{
                      border: "1px solid white",
                      padding: "0.5rem",
                      textAlign: "center",
                    }}
                  >
                    {occurrences}
                  </td>
                );
              })
            : <td
                style={{
                  border: "1px solid white",
                  padding: "0.5rem",
                  textAlign: "center",
                }}
              >
                -
              </td>
            }
          </tr>
          {Array.from(tallyWithCommercialActivities).map(
            ([tallyId, commercialActivitiesObject]) => {
              return (
                <tr key={tallyId}>
                  <td style={{ border: "1px solid white", padding: "0.5rem" }}>
                    {`${commercialActivitiesObject.tallyInfo.startDate} - ${commercialActivitiesObject.tallyInfo.observer}`}
                  </td>
                  {sortedCommercialActivitiesNames.length ?
                    sortedCommercialActivitiesNames.map(
                      (commercialActivityName, key) => {
                        return (
                          <td
                            key={key}
                            style={{
                              border: "1px solid white",
                              padding: "0.5rem",
                              textAlign: "center",
                            }}
                          >
                            {commercialActivitiesObject.commercialActivities ?
                              (
                                commercialActivitiesObject.commercialActivities[
                                  commercialActivityName
                                ] !== 0
                              ) ?
                                commercialActivitiesObject.commercialActivities[
                                  commercialActivityName
                                ]
                              : ""
                            : ""}
                          </td>
                        );
                      },
                    )
                  : <td
                      style={{
                        border: "1px solid white",
                        padding: "0.5rem",
                        textAlign: "center",
                      }}
                    >
                      -
                    </td>
                  }
                </tr>
              );
            },
          )}
        </tbody>
      </table>
    </div>
  );
};

export { CommercialActivitiesTable };
