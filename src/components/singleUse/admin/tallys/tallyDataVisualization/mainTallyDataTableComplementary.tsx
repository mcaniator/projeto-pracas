"use client";

import { TallyInfoAndCommercialActivitiesObject } from "./complementaryDataVisualization";

const MainTallyDataTableComplementary = ({
  tallyMap,
  tallyWithCommercialActivities,
}: {
  tallyMap: Map<string, string | number>;
  tallyWithCommercialActivities: Map<
    number,
    TallyInfoAndCommercialActivitiesObject
  >;
}) => {
  const commercialActivitiesNames: string[] = [];
  let totalCommercialActivities = 0;
  tallyWithCommercialActivities.forEach((tally) => {
    if (
      tally.commercialActivities &&
      Object.keys(tally.commercialActivities).length > 0
    ) {
      Object.entries(tally.commercialActivities).forEach(([key, value]) => {
        if (value) {
          totalCommercialActivities += value;
          if (value !== 0 && !commercialActivitiesNames.includes(key)) {
            commercialActivitiesNames.push(key);
          }
        }
      });
    }
  });
  commercialActivitiesNames.sort();

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th
              style={{ border: "1px solid white", padding: "0.5rem" }}
              colSpan={commercialActivitiesNames.length + 1}
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
              colSpan={commercialActivitiesNames.length}
            >
              {totalCommercialActivities}
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid white", padding: "0.5rem" }}>
              Tipos
            </td>
            {commercialActivitiesNames.map((commercialActivity, key) => {
              return (
                <td
                  key={key}
                  style={{ border: "1px solid white", padding: "0.5rem" }}
                >
                  {commercialActivity}
                </td>
              );
            })}
          </tr>
          {Array.from(tallyWithCommercialActivities).map(
            ([tallyId, commercialActivitiesObject]) => {
              return (
                <tr key={tallyId}>
                  <td style={{ border: "1px solid white", padding: "0.5rem" }}>
                    {`${commercialActivitiesObject.tallyInfo.startDate} - ${commercialActivitiesObject.tallyInfo.observer}`}
                  </td>
                  {commercialActivitiesNames.map(
                    (commercialActivityName, key) => {
                      return (
                        <td
                          key={key}
                          style={{
                            border: "1px solid white",
                            padding: "0.5rem",
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
                  )}
                </tr>
              );
            },
          )}
        </tbody>
      </table>
    </div>
  );
};

export { MainTallyDataTableComplementary };
export { type TallyInfoAndCommercialActivitiesObject };
