import { booleanFromString } from "@/lib/zodValidators";
import { z } from "zod";

export const fetchFormParamsSchema = z.object({
  finalizedOnly: booleanFromString.nullish(),
  includeArchived: booleanFromString.nullish(),
});

export type FetchFormParams = z.infer<typeof fetchFormParamsSchema>;

export const fetchFormEditorParamsSchema = z.object({
  formId: z.coerce.number(),
});

export type FetchFormEditorParams = z.infer<
  typeof fetchFormEditorParamsSchema
>;

export const createFormDataSchema = z.instanceof(FormData);

export type CreateFormData = z.infer<typeof createFormDataSchema>;

export const updateFormArchiveStatusDataSchema = z.instanceof(FormData);

export type UpdateFormArchiveStatusData = z.infer<
  typeof updateFormArchiveStatusDataSchema
>;

export const updateFormDataSchema = z.custom<unknown>();

export type UpdateFormData = z.infer<typeof updateFormDataSchema>;
