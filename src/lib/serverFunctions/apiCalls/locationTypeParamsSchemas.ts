import { z } from "zod";

export const saveLocationTypeDataSchema = z.instanceof(FormData);

export type SaveLocationTypeData = z.infer<
  typeof saveLocationTypeDataSchema
>;
