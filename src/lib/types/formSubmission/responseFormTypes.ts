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

export const formSubmissionOptionValueWithOverrideSchema = z.object({
  value: z.number(),
  override: z.string().nullable(),
});

export type FormSubmissionOptionValueWithOverride = z.infer<
  typeof formSubmissionOptionValueWithOverrideSchema
>;

export const responseQuestionValueSchema = z.union([
  z.string(),
  z.number(),
  formSubmissionOptionValueWithOverrideSchema,
  z.array(formSubmissionOptionValueWithOverrideSchema),
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
  formSubmissionOptionValueWithOverrideSchema,
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

export function isFormSubmissionOptionValueWithOverride(
  rawValue: ResponseQuestionValue | undefined,
): rawValue is FormSubmissionOptionValueWithOverride {
  return formSubmissionOptionValueWithOverrideSchema.safeParse(rawValue)
    .success;
}

export function isFormSubmissionOptionValueWithOverrideArray(
  value: unknown,
): value is FormSubmissionOptionValueWithOverride[] {
  return z.array(formSubmissionOptionValueWithOverrideSchema).safeParse(value)
    .success;
}
