"use client ";

import { Gender } from "@enums/personCharacteristics";
import React from "react";

const PersonsDatavisualizationTables = ({
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
  const booleanCharacteristicsNamesInTableMap = new Map([
    ["noBooleanCharacteristic", "Padrão"],
    ["isPersonWithImpairment", "Deficiente"],
    ["isTraversing", "Passando"],
    ["isInApparentIllicitActivity", "Atividade ilícita"],
    ["isPersonWithoutHousing", "Situação de rua"],
  ]);
  const ageGroupsInOrder = ["ADULT", "ELDERLY", "CHILD", "TEEN"];
  const gendersInOrder = ["MALE", "FEMALE"];
  const activitiesInOrder = ["SEDENTARY", "WALKING", "STRENUOUS"];
  const booleanCharacteristicsInOrder = [
    "noBooleanCharacteristic",
    "isTraversing",
    "isPersonWithImpairment",
    "isInApparentIllicitActivity",
    "isPersonWithoutHousing",
  ];
  return (
    <div className="flex w-full max-w-[85rem] flex-col gap-1 overflow-auto rounded">
      <table className="text-sm sm:text-base">
        {ageGroupsInOrder.map((ageGroup, ageGroupKey) => {
          return (
            <React.Fragment key={ageGroupKey}>
              <thead>
                <tr>
                  <th className="border border-white xl:p-1">
                    {ageGroupsNamesInTableMap.get(ageGroup)}
                  </th>
                  {gendersInOrder.map((gender, genderKey) => {
                    return (
                      <th
                        className="border border-white xl:p-1"
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
                        <td className="border border-white xl:p-1">
                          {activitiesNamesInTableMap.get(activity)}
                        </td>
                        {gendersInOrder.map((gender, genderKey) => {
                          return (
                            <td
                              key={genderKey}
                              className="border border-white text-center xl:p-1"
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
                <tr>
                  <td className="border border-white xl:p-1">Total</td>
                  {gendersInOrder.map((gender, genderKey) => {
                    return (
                      <td
                        key={genderKey}
                        className="border border-white text-center xl:p-1"
                      >
                        {tallyMap.get(`Tot-${gender}-${ageGroup}`)}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </React.Fragment>
          );
        })}
      </table>

      <table className="text-sm sm:text-base">
        <thead>
          <tr>
            <th className="border border-white xl:p-1">SEXO</th>
            {gendersInOrder.map((gender, genderKey) => {
              return (
                <th className="border border-white xl:p-1" key={genderKey}>
                  {gendersNamesInTableMap.get(gender)}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-white xl:p-1">Total</td>
            {gendersInOrder.map((gender, genderKey) => {
              return (
                <td
                  className="border border-white text-center xl:p-1"
                  key={genderKey}
                >
                  {tallyMap.get(`Tot-${gender}`)}
                </td>
              );
            })}
          </tr>
          <tr>
            <td className="border border-white xl:p-1">%</td>
            {gendersInOrder.map((gender, genderKey) => {
              return (
                <td
                  className="border border-white text-center xl:p-1"
                  key={genderKey}
                >
                  {tallyMap.get(`%${gender}`)?.toString().replace(".", ",")}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>

      <div className="rounded border border-white p-4 md:hidden">
        {ageGroupsInOrder.map((ageGroup, ageGroupKey) => {
          return (
            <div key={ageGroupKey} className="flex w-full gap-1">
              <strong>{`${ageGroupsNamesInTableMap.get(ageGroup)}:`}</strong>
              <span>{`${tallyMap.get(`Tot-${ageGroup}`)}`}</span>
              <span className="ml-auto">
                {tallyMap.get(`%${ageGroup}`)?.toString().replace(".", ",")}
              </span>
            </div>
          );
        })}
      </div>

      <table className="hidden text-sm sm:text-base md:table">
        <thead>
          <tr>
            <th className="border border-white xl:p-1">IDADE</th>
            {ageGroupsInOrder.map((ageGroup, ageGroupKey) => {
              return (
                <th key={ageGroupKey} className="border border-white xl:p-1">
                  {ageGroupsNamesInTableMap.get(ageGroup)}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-white xl:p-1">Total</td>
            {ageGroupsInOrder.map((ageGroup, ageGroupKey) => {
              return (
                <td
                  className="border border-white text-center xl:p-1"
                  key={ageGroupKey}
                >
                  {tallyMap.get(`Tot-${ageGroup}`)}
                </td>
              );
            })}
          </tr>
          <tr>
            <td className="border border-white xl:p-1">%</td>
            {ageGroupsInOrder.map((ageGroup, ageGroupKey) => {
              return (
                <td
                  className="border border-white text-center xl:p-1"
                  key={ageGroupKey}
                >
                  {tallyMap.get(`%${ageGroup}`)?.toString().replace(".", ",")}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>

      <div className="rounded border border-white p-4 md:hidden">
        {activitiesInOrder.map((activity, activityKey) => {
          return (
            <div key={activityKey} className="flex w-full gap-1">
              <strong>
                {activitiesNamesInTableMap.get(activity)?.toUpperCase()}
              </strong>
              <span>{tallyMap.get(`Tot-${activity}`)}</span>
              <span className="ml-auto">
                {tallyMap.get(`%${activity}`)?.toString().replace(".", ",")}
              </span>
            </div>
          );
        })}
      </div>

      <table className="hidden text-sm sm:text-base md:table">
        <thead>
          <tr>
            <th className="border border-white xl:p-1">ATIVIDADE</th>
            {activitiesInOrder.map((activity, activityKey) => {
              return (
                <th className="border border-white xl:p-1" key={activityKey}>
                  {activitiesNamesInTableMap.get(activity)?.toUpperCase()}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-white xl:p-1">Total</td>
            {activitiesInOrder.map((activity, activityKey) => {
              return (
                <td
                  className="border border-white text-center xl:p-1"
                  key={activityKey}
                >
                  {tallyMap.get(`Tot-${activity}`)}
                </td>
              );
            })}
          </tr>
          <tr>
            <td className="border border-white xl:p-1">%</td>
            {activitiesInOrder.map((activity, activityKey) => {
              return (
                <td
                  className="border border-white text-center xl:p-1"
                  key={activityKey}
                >
                  {tallyMap.get(`%${activity}`)}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>

      <div className="rounded border border-white p-4 md:hidden lg:hidden">
        {booleanCharacteristicsInOrder.map((characteristic, key) => {
          return (
            <div key={key} className="flex w-full gap-1">
              <strong>
                {booleanCharacteristicsNamesInTableMap
                  .get(characteristic)
                  ?.toUpperCase()}
              </strong>
              <span>
                {Array.from(Object.keys(Gender))
                  .map(
                    (gender) =>
                      tallyMap.get(`${gender}-${characteristic}`) || 0,
                  )
                  .reduce(
                    (acc, value) =>
                      typeof acc === "number" && typeof value === "number" ?
                        acc + value
                      : 0,
                    0,
                  )}
              </span>
              <span className="ml-auto">
                {tallyMap
                  .get(`%${characteristic}`)
                  ?.toString()
                  .replace(".", ",")}
              </span>
            </div>
          );
        })}
      </div>

      <table className="hidden text-sm sm:text-base md:table">
        <thead>
          <tr>
            <th className="border border-white xl:p-1">
              CARACTERÍSTICAS BINÁRIAS
            </th>

            {booleanCharacteristicsInOrder.map((characteristic, key) => {
              return (
                <th key={key} className="border border-white xl:p-1">
                  {booleanCharacteristicsNamesInTableMap
                    .get(characteristic)
                    ?.toUpperCase()}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-white xl:p-1">Total</td>
            {booleanCharacteristicsInOrder.map((characteristic, key) => {
              return (
                <td key={key} className="border border-white xl:p-1">
                  {Array.from(Object.keys(Gender))
                    .map(
                      (gender) =>
                        tallyMap.get(`${gender}-${characteristic}`) || 0,
                    )
                    .reduce(
                      (acc, value) =>
                        typeof acc === "number" && typeof value === "number" ?
                          acc + value
                        : 0,
                      0,
                    )}
                </td>
              );
            })}
          </tr>
          <tr>
            <td className="border border-white xl:p-1">%</td>
            {booleanCharacteristicsInOrder.map((characteristic, key) => {
              return (
                <td key={key} className="border border-white xl:p-1">
                  {tallyMap.get(`%${characteristic}`)}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>

      <table className="w-full">
        <thead>
          <tr>
            <th className="border border-white xl:p-1">Total de pessoas</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-white text-center xl:p-1">
              {tallyMap.get(`Tot-H&M`)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export { PersonsDatavisualizationTables };
