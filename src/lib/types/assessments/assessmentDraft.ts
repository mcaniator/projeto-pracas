import {
  responseFormGeometrySchema,
  serializedFormValuesSchema,
} from "@/lib/types/formSubmission/responseFormTypes";
import { z } from "zod";

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
