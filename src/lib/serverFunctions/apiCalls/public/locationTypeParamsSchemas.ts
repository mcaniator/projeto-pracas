import { z } from "zod";

export const publicFetchLocationTypesParamsSchema = z.object({
  cityId: z.coerce.number(),
});

export type PublicFetchLocationTypesParams = z.infer<
  typeof publicFetchLocationTypesParamsSchema
>;
