import { Activity, AgeGroup, Gender, WeatherConditions } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";

type CommercialActivitiesObject = {
  [key: string]: number;
};
type TallyInfo = {
  observer: string;
  startDate: string;
};
type TallyInfoAndCommercialActivitiesObject = {
  tallyInfo: TallyInfo;
  commercialActivities: CommercialActivitiesObject;
};

type TallyPersonWithCharacteristics = {
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
};

type TallyDataFetched = {
  tallyPerson: TallyPersonWithCharacteristics[];
  id: number;
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
};

export {
  type TallyInfoAndCommercialActivitiesObject,
  type TallyPersonWithCharacteristics,
  type TallyDataFetched,
};
