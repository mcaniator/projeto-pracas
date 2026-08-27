import dayjs, { type Dayjs } from "dayjs";
import type { Coordinate } from "ol/coordinate";
import type { Type } from "ol/geom/Geometry";
import { z } from "zod";

export const responseGeometryTypeSchema = z.enum([
  "POINT",
  "POLYGON",
  "POINT_AND_POLYGON",
]);

export type ResponseGeometryType = z.infer<typeof responseGeometryTypeSchema>;

export const responseGeometrySchema = z.object({
  type: z.custom<Type>(),
  coordinates: z.custom<Coordinate | Coordinate[][]>(),
});

export type ResponseGeometry = z.infer<typeof responseGeometrySchema>;

export const responseFormGeometrySchema = z.object({
  questionId: z.number(),
  geometries: z.array(responseGeometrySchema),
});

export type ResponseFormGeometry = z.infer<typeof responseFormGeometrySchema>;

export const responseFormImageSyncStatusSchema = z.enum(["SYNCED", "UNSYNCED"]);

export type ResponseFormImageSyncStatus = z.infer<
  typeof responseFormImageSyncStatusSchema
>;

export const responseFormImageSchema = z.object({
  file: z
    .custom<File>((value) =>
      typeof File !== "undefined" ? value instanceof File : false,
    )
    .optional(),
  url: z.string().optional(),
  status: responseFormImageSyncStatusSchema,
});

export type ResponseFormImage = z.infer<typeof responseFormImageSchema>;

export const responseFormImagesSchema = z.record(
  z.string(),
  z.array(responseFormImageSchema),
);

export type ResponseFormImages = z.infer<typeof responseFormImagesSchema>;

export const simpleMentionSchema = z.object({
  id: z.string(),
  display: z.string(),
});

export type SimpleMention = z.infer<typeof simpleMentionSchema>;

export const assessmentOptionValueWithOverrideSchema = z.object({
  value: z.number(),
  override: z.string().nullable(),
});

export type AssessmentOptionValueWithOverride = z.infer<
  typeof assessmentOptionValueWithOverrideSchema
>;

export const responseQuestionValueSchema = z.union([
  z.string(),
  z.number(),
  assessmentOptionValueWithOverrideSchema,
  z.array(assessmentOptionValueWithOverrideSchema),
  z.boolean(),
  z.custom<Dayjs>(dayjs.isDayjs),
  z.null(),
]);

export type ResponseQuestionValue = z.infer<typeof responseQuestionValueSchema>;

export const serializedOptionValueWithOverrideSchema = z.object({
  value: z.number(),
  override: z.string().nullable(),
});

export type SerializedOptionValueWithOverride = z.infer<
  typeof serializedOptionValueWithOverrideSchema
>;

export const serializedResponseQuestionValueSchema = z.union([
  z.string(),
  z.number(),
  assessmentOptionValueWithOverrideSchema,
  z.array(serializedOptionValueWithOverrideSchema),
  z.boolean(),
  z.null(),
]);

export type SerializedResponseQuestionValue = z.infer<
  typeof serializedResponseQuestionValueSchema
>;

export const formValuesSchema = z.record(
  z.string(),
  responseQuestionValueSchema,
);

export type FormValues = z.infer<typeof formValuesSchema>;

export const serializedFormValuesSchema = z.record(
  z.string(),
  serializedResponseQuestionValueSchema,
);

export type SerializedFormValues = z.infer<typeof serializedFormValuesSchema>;

export const assessmentDraftSchema = z.object({
  id: z.coerce.number(),
  userId: z.string(),
  username: z.string(),
  serverUpdatedAt: z.coerce.date(),
  localUpdatedAt: z.coerce.date(),
  isFinalized: z.boolean(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable(),
  driveFolderUrl: z.string().nullable(),
  responseFormValues: serializedFormValuesSchema,
  geometries: z.array(responseFormGeometrySchema),
});

export type AssessmentDraft = z.infer<typeof assessmentDraftSchema>;

export function isAssessmentOptionValueWithOverride(
  rawValue: ResponseQuestionValue | undefined,
): rawValue is AssessmentOptionValueWithOverride {
  return assessmentOptionValueWithOverrideSchema.safeParse(rawValue).success;
}

export function isAssessmentOptionValueWithOverrideArray(
  value: unknown,
): value is AssessmentOptionValueWithOverride[] {
  return z.array(assessmentOptionValueWithOverrideSchema).safeParse(value)
    .success;
}
