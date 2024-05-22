"use client ";

import React from "react";

const MainTallyDataTable = ({
  tallyMap,
}: {
  tallyMap: Map<string, string | number>;
}) => {
  const ageGroupsNamesInTableMap = new Map([
    ["ADULT", "ADULTOS"],
    ["ELDERLY", "IDOSOS"],
    ["CHILD", "CRIANÇAS"],
    ["TEEN", "JOVENS"],
  ]);
  const gendersNamesInTableMap = new Map([
    ["MALE", "HOMENS"],
    ["FEMALE", "MULHERES"],
  ]);
  const activitiesNamesInTableMap = new Map([
    ["SEDENTARY", "Sedentário"],
    ["WALKING", "Caminhando"],
    ["STRENUOUS", "Vigoroso"],
  ]);
  const ageGroupsInOrder = ["ADULT", "ELDERLY", "CHILD", "TEEN"];
  const gendersInOrder = ["MALE", "FEMALE"];
  const activitiesInOrder = ["SEDENTARY", "WALKING", "STRENUOUS"];
  console.log(tallyMap);
  return (
    <div className="flex flex-row gap-1 overflow-auto rounded">
      <table style={{ borderCollapse: "collapse", border: "1px solid white" }}>
        {ageGroupsInOrder.map((ageGroup, ageGroupKey) => {
          return (
            <React.Fragment key={ageGroupKey}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid white", padding: "0.5rem" }}>
                    {ageGroupsNamesInTableMap.get(ageGroup)}
                  </th>
                  {gendersInOrder.map((gender, genderKey) => {
                    return (
                      <th
                        style={{ border: "1px solid white", padding: "0.5rem" }}
                        key={genderKey}
                      >
                        {gendersNamesInTableMap.get(gender)}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {activitiesInOrder.map((activity, activityKey) => {
                  return (
                    <React.Fragment key={activityKey}>
                      <tr>
                        <td
                          style={{
                            border: "1px solid white",
                            padding: "0.5rem",
                          }}
                        >
                          {activitiesNamesInTableMap.get(activity)}
                        </td>
                        {gendersInOrder.map((gender, genderKey) => {
                          return (
                            <td
                              key={genderKey}
                              style={{
                                border: "1px solid white",
                                padding: "0.5rem",
                              }}
                            >
                              {tallyMap.get(
                                `${gender}-${ageGroup}-${activity}`,
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </React.Fragment>
          );
        })}
      </table>
      <div className="flex flex-col gap-1">
        <table>
          <thead
            style={{ borderCollapse: "collapse", border: "1px solid white" }}
          >
            <tr>
              <th style={{ border: "1px solid white", padding: "0.5rem" }}>
                SEXO
              </th>
              {gendersInOrder.map((gender, genderKey) => {
                return (
                  <th
                    style={{ border: "1px solid white", padding: "0.5rem" }}
                    key={genderKey}
                  >
                    {gendersNamesInTableMap.get(gender)}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: "1px solid white", padding: "0.5rem" }}>
                Total
              </td>
              {gendersInOrder.map((gender, genderKey) => {
                return (
                  <td
                    style={{ border: "1px solid white", padding: "0.5rem" }}
                    key={genderKey}
                  >
                    {tallyMap.get(`Tot-${gender}`)}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td style={{ border: "1px solid white", padding: "0.5rem" }}>
                %
              </td>
              {gendersInOrder.map((gender, genderKey) => {
                return (
                  <td
                    style={{ border: "1px solid white", padding: "0.5rem" }}
                    key={genderKey}
                  >
                    {tallyMap.get(`%${gender}`)}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
        <table>
          <thead
            style={{ borderCollapse: "collapse", border: "1px solid white" }}
          >
            <tr>
              <th style={{ border: "1px solid white", padding: "0.5rem" }}>
                IDADE
              </th>
              {ageGroupsInOrder.map((ageGroup, ageGroupKey) => {
                return (
                  <th
                    key={ageGroupKey}
                    style={{ border: "1px solid white", padding: "0.5rem" }}
                  >
                    {ageGroupsNamesInTableMap.get(ageGroup)}
                  </th>
                );
              })}
            </tr>
          </thead>
        </table>
      </div>
    </div>
  );
};

export { MainTallyDataTable };
