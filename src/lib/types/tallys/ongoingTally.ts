import { Activity, WeatherConditions } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";

import { TallyPersonWithCharacteristics } from "./tallyDataVisualization";

type OngoingTallyDataFetched = {
  tallyPerson: TallyPersonWithCharacteristics[];
  location: {
    name: string;
  };
  startDate: Date;
  endDate: Date | null;
  user: {
    id: string;
    username: string | null;
  };
  animalsAmount: number | null;
  groups: number | null;
  temperature: number | null;
  weatherCondition: WeatherConditions | null;
  commercialActivities: JsonValue;
};

type WeatherStats = {
  temperature: number | null;
  weather: WeatherConditions;
};

type PersonCharacteristics = {
  FEMALE: {
    activity: Activity;
    isTraversing: boolean;
    isPersonWithImpairment: boolean;
    isInApparentIllicitActivity: boolean;
    isPersonWithoutHousing: boolean;
  };
  MALE: {
    activity: Activity;
    isTraversing: boolean;
    isPersonWithImpairment: boolean;
    isInApparentIllicitActivity: boolean;
    isPersonWithoutHousing: boolean;
  };
};

export {
  type OngoingTallyDataFetched,
  type WeatherStats,
  type PersonCharacteristics,
};
