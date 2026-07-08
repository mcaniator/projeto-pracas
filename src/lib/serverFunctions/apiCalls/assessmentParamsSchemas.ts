import { z } from "zod";

export const fetchAssessmentsParamsSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  formId: z.coerce.number().optional(),
  userId: z.string().optional(),
  locationId: z.coerce.number().optional(),
  narrowUnitId: z.coerce.number().optional(),
  intermediateUnitId: z.coerce.number().optional(),
  broadUnitId: z.coerce.number().optional(),
  cityId: z.coerce.number().optional(),
  finalizationStatus: z.coerce.number().optional(),
});

export type FetchAssessmentsParams = z.infer<
  typeof fetchAssessmentsParamsSchema
>;

export const fetchPublicAssessmentsParamsSchema = z.object({
  locationId: z.coerce.number().optional(),
});

export type FetchPublicAssessmentsParams = z.infer<
  typeof fetchPublicAssessmentsParamsSchema
>;

export const fetchAssessmentTreeParamsSchema = z.object({
  assessmentId: z.string().min(1),
});

export type FetchAssessmentTreeParams = z.infer<
  typeof fetchAssessmentTreeParamsSchema
>;

export const uploadImageResponseParamsSchema = z.object({
  folderId: z.string().min(1),
  image: z
    .instanceof(File)
    .refine((file) => file.size > 0, "Arquivo vazio")
    .refine((file) => file.type.startsWith("image/"), "Arquivo invalido"),
});

export type UploadImageResponseParams = z.infer<
  typeof uploadImageResponseParamsSchema
>;

export const createAssessmentDataSchema = z.instanceof(FormData);

export type CreateAssessmentData = z.infer<typeof createAssessmentDataSchema>;

export const deleteAssessmentDataSchema = z.object({
  assessmentId: z.coerce.number(),
});

export type DeleteAssessmentData = z.infer<typeof deleteAssessmentDataSchema>;

export const updateAssessmentVisibilityDataSchema = z.object({
  assessmentId: z.coerce.number(),
  isPublic: z.boolean(),
});

export type UpdateAssessmentVisibilityData = z.infer<
  typeof updateAssessmentVisibilityDataSchema
>;

export const addResponsesDataSchema = z.object({
  assessmentId: z.coerce.number(),
  responses: z.unknown(),
  geometries: z.array(z.unknown()),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable(),
  isFinalized: z.boolean(),
  driveFolderUrl: z.string().nullable(),
});

export type AddResponsesData = z.infer<typeof addResponsesDataSchema>;
