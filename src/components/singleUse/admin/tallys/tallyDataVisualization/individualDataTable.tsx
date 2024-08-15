"use client";

import { RadioButton } from "@/components/ui/radioButton";
import { Activity, AgeGroup, Gender, WeatherConditions } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";
import { useState } from "react";

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

const weatherConditionsMap = new Map([
  ["CLOUDY", "Nublado"],
  ["SUNNY", "Ensolarado"],
]);
interface TallyPerson {
  person: {
    gender: Gender;
    ageGroup: AgeGroup;
    activity: Activity;
    isTraversing: boolean;
    isPersonWithImpairment: boolean;
    isInApparentIllicitActivity: boolean;
    isPersonWithoutHousing: boolean;
  };
  quantity: number;
}
interface TallyDataFetched {
  tallyPerson: TallyPerson[];
  startDate: Date;
  endDate: Date | null;
  user: {
    username: string;
  };
  animalsAmount: number | null;
  groups: number | null;
  temperature: number | null;
  weatherCondition: WeatherConditions | null;
  commercialActivities: JsonValue;
}
const IndividualDataTable = ({ tallys }: { tallys: TallyDataFetched[] }) => {
  const [showClimateData, setShowClimateData] = useState<boolean>(false);
  const handleIndividualTallyDataTable = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.checked && e.target.value === "climateData")
      setShowClimateData(true);
    else setShowClimateData(false);
  };
  return (
    <div className="flex min-h-56 flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 text-white shadow-md">
      <h3 className="text-2xl font-semibold">Dados sobre as contagens</h3>
      <div className="flex flex-row gap-4">
        <div className="flex items-center">
          <span>
            <label htmlFor="observerData" className="mr-1">
              {"Duração/observador(a)"}
            </label>
          </span>
          <span className="ml-auto">
            <RadioButton
              id="observerData"
              value={"observerData"}
              variant={"default"}
              onChange={handleIndividualTallyDataTable}
              name={"teste2"}
              defaultChecked
            />
          </span>
        </div>
        <div className="flex items-center">
          <span>
            <label htmlFor="climateData" className="mr-1">
              Dados climáticos
            </label>
          </span>
          <span className="ml-auto">
            <RadioButton
              id="climateData"
              value={"climateData"}
              variant={"default"}
              onChange={handleIndividualTallyDataTable}
              name={"teste2"}
            />
          </span>
        </div>
      </div>
      <div className="flex max-h-64 max-w-96 flex-row gap-5 overflow-auto rounded">
        <table
          style={{ borderCollapse: "collapse", border: "1px solid white" }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid white", padding: "0.5rem" }}>
                Data
              </th>
              <th style={{ border: "1px solid white", padding: "0.5rem" }}>
                Horário
              </th>
              <th style={{ border: "1px solid white", padding: "0.5rem" }}>
                {showClimateData ? "Temp.(°C)" : "Duração"}
              </th>
              <th style={{ border: "1px solid white", padding: "0.5rem" }}>
                {showClimateData ? "Tempo" : "Observador(a)"}
              </th>
            </tr>
          </thead>
          <tbody>
            {tallys.map((tally, key) => {
              return (
                <tr key={key}>
                  <td
                    style={{
                      border: "1px solid white",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {dateFormatter.format(tally.startDate.getTime())}
                  </td>
                  <td
                    style={{
                      border: "1px solid white",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {hourFormatter.format(tally.startDate.getTime())}
                  </td>
                  <td
                    style={{
                      border: "1px solid white",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {showClimateData ?
                      tally.temperature ?
                        tally.temperature
                      : ""
                    : tally.endDate ?
                      `${String(Math.floor((tally.endDate?.getTime() - tally.startDate.getTime()) / (1000 * 60 * 60))).padStart(2, "0")}:${String(Math.floor(((tally.endDate?.getTime() - tally.startDate.getTime()) % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, "0")}`
                    : "Em andamento"}
                  </td>
                  <td
                    style={{
                      border: "1px solid white",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {showClimateData ?
                      tally.weatherCondition ?
                        weatherConditionsMap.get(tally.weatherCondition)
                      : ""
                    : formatName(tally.user.username)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { IndividualDataTable };
