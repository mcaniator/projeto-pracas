import { Role } from "@prisma/client";
import { z } from "zod";

export const createInviteDataSchema = z.object({
  email: z.string(),
  roles: z.array(z.nativeEnum(Role)),
  inviteId: z.coerce.number().optional(),
});

export type CreateInviteData = z.infer<typeof createInviteDataSchema>;

export const deleteInviteDataSchema = z.object({
  id: z.coerce.number(),
});

export type DeleteInviteData = z.infer<typeof deleteInviteDataSchema>;
