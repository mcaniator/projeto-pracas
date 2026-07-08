import { z } from "zod";

export const fetchDynamicIconsParamsSchema = z.object({
  query: z.string().optional().nullish(),
  limit: z.coerce.number().int().positive().nullish(),
});

export type FetchDynamicIconsParams = z.infer<
  typeof fetchDynamicIconsParamsSchema
>;
