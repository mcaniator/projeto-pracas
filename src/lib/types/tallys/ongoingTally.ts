import { WeatherConditions } from "@prisma/client";
import { TallyPerson } from "@zodValidators";

import { ActivityType, AgeGroupType, GenderType } from "./person";

type WeatherStats = {
  temperature: number | null;
  weather: WeatherConditions;
};

type PersonCharacteristics = {
  gender: GenderType;
  ageGroup: AgeGroupType;
  activity: ActivityType;
  isTraversing: boolean;
  isPersonWithImpairment: boolean;
  isInApparentIllicitActivity: boolean;
  isPersonWithoutHousing: boolean;
};

export { type WeatherStats, type PersonCharacteristics, type TallyPerson };
