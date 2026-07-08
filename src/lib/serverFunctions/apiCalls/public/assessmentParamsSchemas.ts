import { z } from "zod";

export const publicFetchPublicAssessmentsParamsSchema = z.object({
  locationId: z.coerce.number().optional(),
});

export type PublicFetchPublicAssessmentsParams = z.infer<
  typeof publicFetchPublicAssessmentsParamsSchema
>;

export const publicFetchPublicAssessmentTreeParamsSchema = z.object({
  assessmentId: z.string().min(1),
});

export type PublicFetchPublicAssessmentTreeParams = z.infer<
  typeof publicFetchPublicAssessmentTreeParamsSchema
>;
