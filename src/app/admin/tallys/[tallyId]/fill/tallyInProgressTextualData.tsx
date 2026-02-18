"use client";

import CIconChip from "@/components/ui/cIconChip";
import { WeatherConditions } from "@prisma/client";
import {
  IconBinocularsFilled,
  IconDog,
  IconMoodDollar,
  IconTemperature,
} from "@tabler/icons-react";
import { OngoingTally } from "@zodValidators";
import { FaPeopleGroup } from "react-icons/fa6";
import { TiWeatherPartlySunny } from "react-icons/ti";

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
  tally: OngoingTally;
  temperature: number | null;
  weather: WeatherConditions;
  complementaryData: { animalsAmount: number; groupsAmount: number };
  commercialActivities: CommercialActivitiesObject;
}) => {
  return (
    <div className="flex flex-col overflow-auto py-1">
      <p>
        <CIconChip icon={<IconBinocularsFilled />} tooltip="Observador" />
        {`${tally.user.username}`}
      </p>
      <p>
        <CIconChip icon={<IconTemperature />} tooltip="Temperatura" />
        {`${temperature ? temperature + "°C" : "Não definido!"}`}
      </p>
      <p>
        <CIconChip
          icon={<TiWeatherPartlySunny />}
          tooltip="Condição climática"
        />
        {`${weather}`}
      </p>
      <p>
        <CIconChip icon={<IconDog />} tooltip="Animais" />
        {`${complementaryData.animalsAmount}`}
      </p>
      <p>
        <CIconChip icon={<FaPeopleGroup />} tooltip="Grupos" />
        {`${complementaryData.groupsAmount}`}
      </p>
      <div className="w-full overflow-auto rounded-3xl bg-gray-400/20 p-3 shadow-inner">
        <CIconChip
          icon={<IconMoodDollar />}
          tooltip="Atividades comerciais itinerantes"
        />
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
