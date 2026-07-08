import { z } from "zod";

export const fetchLocationsParamsSchema = z.object({
  cityId: z.coerce.number().nullish(),
  locationId: z.coerce.number().nullish(),
});

export type FetchLocationsParams = z.infer<typeof fetchLocationsParamsSchema>;

export const createLocationDataSchema = z.instanceof(FormData);

export type CreateLocationData = z.infer<typeof createLocationDataSchema>;

export const updateLocationDataSchema = z.instanceof(FormData);

export type UpdateLocationData = z.infer<typeof updateLocationDataSchema>;

export const deleteLocationDataSchema = z.instanceof(FormData);

export type DeleteLocationData = z.infer<typeof deleteLocationDataSchema>;

export const updateLocationVisibilityDataSchema = z.object({
  id: z.coerce.number(),
  isPublic: z.boolean(),
});

export type UpdateLocationVisibilityData = z.infer<
  typeof updateLocationVisibilityDataSchema
>;

export const editLocationPolygonDataSchema = z.object({
  id: z.coerce.number(),
  featuresGeoJson: z.string(),
});

export type EditLocationPolygonData = z.infer<
  typeof editLocationPolygonDataSchema
>;
