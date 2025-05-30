import { Role } from "@prisma/client";
import "server-only";

import PermissionError from "../errors/permissionError";
import { auth } from "../lib/auth/auth";
import {
  RoleGroup,
  checkIfRolesArrayContainsAll,
  checkIfRolesArrayContainsAny,
} from "../lib/auth/rolesUtil";
import { prisma } from "../lib/prisma";

const checkIfLoggedInUserHasAnyPermission = async ({
  roles,
  roleGroups,
}: {
  roles?: Role[];
  roleGroups?: RoleGroup[];
}) => {
  try {
    const session = await auth();
    if (!session?.user.id) {
      throw new PermissionError("Error reading user from JWT");
    }
    const user = (await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        roles: true,
      },
    })) as { roles: Role[] } | null;
    if (!user) {
      throw new PermissionError("User not found");
    }
    const hasPermission = checkIfRolesArrayContainsAny(user.roles, {
      roles,
      roleGroups,
    });
    if (!hasPermission) {
      throw new PermissionError("User does not have any required permission");
    }
  } catch (error) {
    if (error instanceof PermissionError) {
      throw error;
    }
    throw new PermissionError("Error checking permissions");
  }
};

const checkIfLoggedInUserHasAllPermissions = async ({
  roles,
  roleGroups,
}: {
  roles?: Role[];
  roleGroups?: RoleGroup[];
}) => {
  try {
    const session = await auth();
    if (!session?.user.id) {
      throw new PermissionError("Error reading user from JWT");
    }
    const user = (await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        roles: true,
      },
    })) as { roles: Role[] } | null;
    if (!user) {
      throw new PermissionError("User not found");
    }
    const hasPermission = checkIfRolesArrayContainsAll(user.roles, {
      roles,
      roleGroups,
    });
    if (!hasPermission) {
      throw new PermissionError("User does not have all required permissions");
    }
  } catch (error) {
    if (error instanceof PermissionError) {
      throw error;
    }
    throw new Error("Error checking permissions");
  }
};

export {
  checkIfLoggedInUserHasAnyPermission,
  checkIfLoggedInUserHasAllPermissions,
};
