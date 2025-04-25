import { Features } from "@prisma/client";
import "server-only";

import PermissionError from "../erros/permissionError";
import { prisma } from "../lib/prisma";

const checkIfHasAnyPermission = async (
  userId: string | null | undefined,
  permissions: Features[],
) => {
  if (!userId) {
    throw new PermissionError("User does not have any required permission");
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        permissions: true,
      },
    });
    if (!user) {
      throw new Error("User not found");
    }
    const hasPermission = user.permissions.some((userPermission) =>
      permissions.includes(userPermission.feature),
    );
    if (!hasPermission) {
      throw new PermissionError("User does not have any required permission");
    }
  } catch (error) {
    throw new Error("Error checking permissions");
  }
};

const checkIfHasAllPermissions = async (
  userId: string,
  permissions: Features[],
) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        permissions: true,
      },
    });
    if (!user) {
      throw new Error("User not found");
    }
    const hasPermission = user.permissions.every((userPermission) =>
      permissions.includes(userPermission.feature),
    );
    if (!hasPermission) {
      throw new PermissionError("User does not have all required permissions");
    }
  } catch (error) {
    throw new Error("Error checking permissions");
  }
};

export { checkIfHasAnyPermission, checkIfHasAllPermissions };
