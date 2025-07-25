import { Activity, AgeGroup, Gender } from "@enums/personCharacteristics";

type ActivityType = keyof typeof Activity;
type AgeGroupType = keyof typeof AgeGroup;
type GenderType = keyof typeof Gender;

export type { ActivityType, AgeGroupType, GenderType };
