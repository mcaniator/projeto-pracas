import { z } from "zod";

export const publicFetchLocationsParamsSchema = z.object({
  cityId: z.coerce.number().nullish(),
  locationId: z.coerce.number().nullish(),
});

export type PublicFetchLocationsParams = z.infer<
  typeof publicFetchLocationsParamsSchema
>;
