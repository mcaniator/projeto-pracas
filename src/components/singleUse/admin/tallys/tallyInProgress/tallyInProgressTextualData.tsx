"use client";

import { Activity, AgeGroup, Gender, WeatherConditions } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";
import {
  IconBinocularsFilled,
  IconCalendar,
  IconClock,
  IconDog,
  IconMoodDollar,
  IconTemperature,
} from "@tabler/icons-react";
import { FaPeopleGroup } from "react-icons/fa6";
import { TiWeatherPartlySunny } from "react-icons/ti";

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
    username: string | null;
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
      <p>
        <IconCalendar className="mr-2 inline" />
        {`${tally.startDate.toLocaleString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", year: "2-digit" })}`}
      </p>
      <p>
        <IconClock className="mr-2 inline" />
        {`${tally.startDate.toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}
      </p>
      <p>
        <IconBinocularsFilled className="mr-2 inline" />
        {`${tally.user.username}`}
      </p>
      <p>
        <IconTemperature className="mr-2 inline" />
        {`${temperature ? temperature + "°C" : "Não definido!"}`}
      </p>
      <p>
        <TiWeatherPartlySunny className="mb-2 mr-2 inline h-6 w-6" />
        {`${weather}`}
      </p>
      <p>
        <IconDog className="mr-2 inline" />
        {`${complementaryData.animalsAmount}`}
      </p>
      <p>
        <FaPeopleGroup className="mb-2 mr-2 inline h-6 w-6" />
        {`${complementaryData.groupsAmount}`}
      </p>
      <div className="w-fit overflow-auto rounded-3xl bg-gray-400/20 p-3 shadow-inner">
        <h5 className="font-semibold">
          <IconMoodDollar />
        </h5>
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
