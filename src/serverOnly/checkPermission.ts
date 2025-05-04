import { Role } from "@prisma/client";
import "server-only";

import PermissionError from "../errors/permissionError";
import { prisma } from "../lib/prisma";

const checkIfHasAnyPermission = async (
  userId: string | null | undefined,
  roles: Role[],
) => {
  if (!userId) {
    throw new PermissionError("User does not have any required permission");
  }
  const user = (await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      roles: true,
    },
  })) as { roles: Role[] } | null;
  if (!user) {
    throw new PermissionError("User not found");
  }
  const hasPermission = user.roles.some((userRole) => roles.includes(userRole));
  if (!hasPermission) {
    throw new PermissionError("User does not have any required permission");
  }
};

const checkIfHasAllPermissions = async (userId: string, roles: Role[]) => {
  try {
    const user = (await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        roles: true,
      },
    })) as { roles: Role[] } | null;
    if (!user) {
      throw new Error("User not found");
    }
    const hasPermission = user.roles.every((userRole) =>
      roles.includes(userRole),
    );
    if (!hasPermission) {
      throw new PermissionError("User does not have all required permissions");
    }
  } catch (error) {
    throw new Error("Error checking permissions");
  }
};

export { checkIfHasAnyPermission, checkIfHasAllPermissions };
