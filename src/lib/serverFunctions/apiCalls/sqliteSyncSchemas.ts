import { z } from "zod";

export const sqliteSyncParamsSchema = z.object({
  userId: z.string(),
  cityId: z.coerce.number(),
});

export type SQLiteSyncParams = z.infer<typeof sqliteSyncParamsSchema>;
