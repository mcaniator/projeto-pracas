import { z } from "zod";

export const fetchMapAssessmentComparisonResultsParamsSchema = z.object({
  cityId: z.coerce.number(),
  categoryId: z.coerce.number(),
});

export type FetchMapAssessmentComparisonResultsParams = z.infer<
  typeof fetchMapAssessmentComparisonResultsParamsSchema
>;

export const fetchMapAssessmentComparisonAssessmentTreesParamsSchema = z.object(
  {
    categoryId: z.coerce.number(),
    locationIds: z
      .string()
      .transform((value) =>
        value.split(",").map((id) => z.coerce.number().parse(id)),
      ),
  },
);

export type FetchMapAssessmentComparisonAssessmentTreesParams = z.infer<
  typeof fetchMapAssessmentComparisonAssessmentTreesParamsSchema
>;
