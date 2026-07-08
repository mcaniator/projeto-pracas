import { z } from "zod";

export const exportRegistrationDataSchema = z.object({
  locationsIds: z.array(z.coerce.number()),
});

export type ExportRegistrationData = z.infer<
  typeof exportRegistrationDataSchema
>;

export const exportAssessmentsDataSchema = z.object({
  assessmentIds: z.array(z.coerce.number()),
});

export type ExportAssessmentsData = z.infer<typeof exportAssessmentsDataSchema>;

export const exportDailyTallysDataSchema = z.object({
  locationIds: z.array(z.coerce.number()),
  tallysIds: z.array(z.coerce.number()),
});

export type ExportDailyTallysData = z.infer<
  typeof exportDailyTallysDataSchema
>;

export const exportDailyTallysFromSingleLocationDataSchema = z.object({
  tallysIds: z.array(z.coerce.number()),
});

export type ExportDailyTallysFromSingleLocationData = z.infer<
  typeof exportDailyTallysFromSingleLocationDataSchema
>;

export const exportIndividualTallysToCSVDataSchema = z.object({
  tallysIds: z.array(z.coerce.number()),
});

export type ExportIndividualTallysToCSVData = z.infer<
  typeof exportIndividualTallysToCSVDataSchema
>;
