import { z } from "zod";

export const fetchTallysParamsSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  userId: z.string().optional(),
  locationId: z.coerce.number().optional(),
  narrowUnitId: z.coerce.number().optional(),
  intermediateUnitId: z.coerce.number().optional(),
  broadUnitId: z.coerce.number().optional(),
  cityId: z.coerce.number().optional(),
  finalizationStatus: z.coerce.number().optional(),
});

export type FetchTallysParams = z.infer<typeof fetchTallysParamsSchema>;

export const fetchOngoingTallyParamsSchema = z.object({
  tallyId: z.coerce.number(),
});

export type FetchOngoingTallyParams = z.infer<
  typeof fetchOngoingTallyParamsSchema
>;

export const fetchFinalizedTallysDataVisualizationParamsSchema = z.object({
  tallyIds: z
    .string()
    .or(z.array(z.coerce.number()))
    .transform((value) =>
      Array.isArray(value) ?
        value
      : value.split(",").map((id) => z.coerce.number().parse(id)),
    ),
});

export type FetchFinalizedTallysDataVisualizationParams = z.infer<
  typeof fetchFinalizedTallysDataVisualizationParamsSchema
>;

export const createTallyDataSchema = z.instanceof(FormData);

export type CreateTallyData = z.infer<typeof createTallyDataSchema>;

export const saveOngoingTallyDataSchema = z.object({
  tallyId: z.coerce.number(),
  weatherStats: z.unknown(),
  tallyMapEntries: z.array(z.tuple([z.string(), z.coerce.number()])),
  commercialActivities: z.unknown(),
  complementaryData: z.object({
    animalsAmount: z.coerce.number(),
    groupsAmount: z.coerce.number(),
  }),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable(),
  isFinalized: z.boolean(),
});

export type SaveOngoingTallyData = z.infer<
  typeof saveOngoingTallyDataSchema
>;

export const deleteTallyDataSchema = z.object({
  tallyId: z.coerce.number(),
});

export type DeleteTallyData = z.infer<typeof deleteTallyDataSchema>;
