import { z } from "zod";

export const publicFetchCategoriesParamsSchema = z.object({
  cityId: z.coerce.number(),
});

export type PublicFetchCategoriesParams = z.infer<
  typeof publicFetchCategoriesParamsSchema
>;
