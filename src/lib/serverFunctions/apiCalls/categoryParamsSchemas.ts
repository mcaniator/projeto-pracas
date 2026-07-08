import { z } from "zod";

export const categorySubmitDataSchema = z.instanceof(FormData);

export type CategorySubmitData = z.infer<typeof categorySubmitDataSchema>;

export const subcategorySubmitDataSchema = z.instanceof(FormData);

export type SubcategorySubmitData = z.infer<
  typeof subcategorySubmitDataSchema
>;

export const deleteCategoryDataSchema = z.instanceof(FormData);

export type DeleteCategoryData = z.infer<typeof deleteCategoryDataSchema>;

export const deleteSubcategoryDataSchema = z.instanceof(FormData);

export type DeleteSubcategoryData = z.infer<
  typeof deleteSubcategoryDataSchema
>;
