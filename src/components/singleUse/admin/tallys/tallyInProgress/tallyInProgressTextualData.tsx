"use client";

import { Activity, AgeGroup, Gender, WeatherConditions } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";

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
interface ongoingTallyDataFetched {
  tallyPerson: TallyPerson[];
  location: {
    name: string;
  };
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
interface CommercialActivitiesObject {
  [key: string]: number;
}
const TallyInProgressTextualData = ({
  tally,
  temperature,
  weather,
  complementaryData,
  commercialActivities,
}: {
  tally: ongoingTallyDataFetched;
  temperature: number | null;
  weather: WeatherConditions;
  complementaryData: { animalsAmount: number; groupsAmount: number };
  commercialActivities: CommercialActivitiesObject;
}) => {
  return (
    <div className="flex flex-col overflow-auto py-1">
      <p>{`Data de início: ${tally.startDate.toLocaleString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", year: "2-digit" })}`}</p>
      <p>{`Horário de início: ${tally.startDate.toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}</p>
      <p>{`Observador: ${tally.user.username}`}</p>
      <p>{`Temperatura: ${temperature ? temperature + "°C" : "Não definido!"}`}</p>
      <p>{`Tempo: ${weather}`}</p>
      <p>{`Pets: ${complementaryData.animalsAmount}`}</p>
      <p>{`Grupos: ${complementaryData.groupsAmount}`}</p>
      <div className="w-fit overflow-auto rounded-3xl bg-gray-400/20 p-3 shadow-inner">
        <h5 className="font-semibold">Atividades comerciais itinerantes</h5>
        {(
          Object.entries(commercialActivities).filter(
            ([, value]) => value !== 0,
          ).length > 0
        ) ?
          Object.entries(commercialActivities).map(([key, value]) => {
            if (value !== 0) {
              return (
                <p key={key} className="break-all">{`${key}: ${value}`}</p>
              );
            }
          })
        : "Nenhuma atividade comerical initerante registrada!"}
      </div>
    </div>
  );
};

export { TallyInProgressTextualData };
