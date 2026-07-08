import { Role } from "@prisma/client";
import { z } from "zod";

export const updateUserRolesDataSchema = z.object({
  userId: z.string(),
  roles: z.array(z.nativeEnum(Role)),
});

export type UpdateUserRolesData = z.infer<typeof updateUserRolesDataSchema>;

export const updateUserArchiveDataSchema = z.object({
  userId: z.string(),
  active: z.boolean(),
});

export type UpdateUserArchiveData = z.infer<typeof updateUserArchiveDataSchema>;
