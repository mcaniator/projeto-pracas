import { z } from "zod";

export const fetchPasswordResetTokenParamsSchema = z.object({
  token: z.string().min(1),
});

export type FetchPasswordResetTokenParams = z.infer<
  typeof fetchPasswordResetTokenParamsSchema
>;
