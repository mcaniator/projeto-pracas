import { BrazilianStates } from "@prisma/client";
import { z } from "zod";

export const fetchCitiesParamsSchema = z.object({
  state: z.nativeEnum(BrazilianStates),
  includeAdminstrativeRegions: z.coerce.boolean().optional(),
  includeUniqueAdminstrativeUnitsTitles: z.coerce.boolean().optional(),
});

export type FetchCitiesParams = z.infer<typeof fetchCitiesParamsSchema>;

export const saveCityDataSchema = z.instanceof(FormData);

export type SaveCityData = z.infer<typeof saveCityDataSchema>;

export const deleteCityDataSchema = z.instanceof(FormData);

export type DeleteCityData = z.infer<typeof deleteCityDataSchema>;
