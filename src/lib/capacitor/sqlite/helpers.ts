import { z } from "zod";

const sqliteBooleanSchema = z
  .union([z.literal(0), z.literal(1), z.literal(false), z.literal(true)])
  .transform((value) => value === 1 || value === true);

export { sqliteBooleanSchema };
