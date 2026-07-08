import { z } from "zod";

export const saveAdministrativeUnitDataSchema = z.instanceof(FormData);

export type SaveAdministrativeUnitData = z.infer<
  typeof saveAdministrativeUnitDataSchema
>;

export const deleteAdministrativeUnitDataSchema = z.instanceof(FormData);

export type DeleteAdministrativeUnitData = z.infer<
  typeof deleteAdministrativeUnitDataSchema
>;
