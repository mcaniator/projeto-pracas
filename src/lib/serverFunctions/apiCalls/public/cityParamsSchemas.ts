import { BrazilianStates } from "@prisma/client";
import { z } from "zod";

export const publicFetchCitiesParamsSchema = z.object({
  state: z.nativeEnum(BrazilianStates),
  includeAdminstrativeRegions: z.coerce.boolean().optional(),
});

export type PublicFetchCitiesParams = z.infer<
  typeof publicFetchCitiesParamsSchema
>;
