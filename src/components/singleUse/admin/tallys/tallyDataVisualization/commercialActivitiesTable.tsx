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
  const commercialActivitiesWithTallys: {
    [key: string]: { tally: string; occurrences: number }[];
  } = {};
  for (const tally of tallyWithCommercialActivities) {
    const [, tallyObj] = tally;
    const { tallyInfo, commercialActivities } = tallyObj;
    const tallyUserAndDate = `${tallyInfo.observer} - ${tallyInfo.startDate}`;
    if (!commercialActivities) {
      continue;
    }
    const commercialActivitiesInTally = Object.keys(commercialActivities);
    for (const commercialActivityInTally of commercialActivitiesInTally) {
      if (!commercialActivitiesWithTallys[commercialActivityInTally]) {
        commercialActivitiesWithTallys[commercialActivityInTally] = [];
      }
      commercialActivitiesWithTallys[commercialActivityInTally].push({
        tally: tallyUserAndDate,
        occurrences: commercialActivities[commercialActivityInTally] || 0,
      });
    }
  }
  return (
    <div>
      <div className="flex flex-col gap-2 p-1 xl:hidden">
        <ul className="flex flex-col gap-2">
          {sortedCommercialActivitiesNames.map((commercialActivity, key) => {
            return (
              <li
                key={key}
                className="flex flex-col gap-1 rounded-md p-2 outline outline-1 outline-white"
              >
                <strong>{commercialActivity}:</strong>
                <div className="ml-2">
                  <p>Total: {sortedOccurrences[key]}</p>
                  {commercialActivitiesWithTallys[commercialActivity]?.map(
                    (CAT, index) => {
                      return (
                        <p key={index}>{`${CAT.tally} - ${CAT.occurrences}`}</p>
                      );
                    },
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <p>
          <strong>Total de atividades:</strong> {totalCommercialActivities}
        </p>
      </div>
      <table className="hidden text-sm sm:text-base xl:table">
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
