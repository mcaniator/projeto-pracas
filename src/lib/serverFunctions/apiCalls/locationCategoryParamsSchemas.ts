import { z } from "zod";

export const saveLocationCategoryDataSchema = z.instanceof(FormData);

export type SaveLocationCategoryData = z.infer<
  typeof saveLocationCategoryDataSchema
>;

export const deleteLocationCategoryOrTypeDataSchema = z.instanceof(FormData);

export type DeleteLocationCategoryOrTypeData = z.infer<
  typeof deleteLocationCategoryOrTypeDataSchema
>;
