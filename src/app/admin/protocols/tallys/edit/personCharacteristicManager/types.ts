import type { FetchPersonCharacteristicGroupsResponse } from "@/lib/serverFunctions/queries/personCharacteristic";

export type PersonCharacteristicGroup = NonNullable<
  FetchPersonCharacteristicGroupsResponse
>["personCharacteristicGroups"][number];

export type PersonCharacteristic =
  PersonCharacteristicGroup["personCharacteristics"][number];
