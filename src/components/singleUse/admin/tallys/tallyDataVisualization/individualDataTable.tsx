"use client";

import { Activity, AgeGroup, Gender, WeatherConditions } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";

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
  return (
    <>
      <h3 className="text-2xl font-semibold">Dados sobre as contagens</h3>

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
              {formatName(tally.user.username)}
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
          </div>
        ))}
      </div>
    </>
  );
};

export { IndividualDataTable };
export { type TallyDataFetched };
