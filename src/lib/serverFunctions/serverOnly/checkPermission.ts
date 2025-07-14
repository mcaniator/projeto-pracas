import { auth } from "@auth/auth";
import {
  RoleGroup,
  checkIfRolesArrayContainsAll,
  checkIfRolesArrayContainsAny,
} from "@auth/rolesUtil";
import PermissionError from "@errors/permissionError";
import { Role } from "@prisma/client";
import {
  getSignedCookieValue,
  setSignedCookie,
} from "@signedCookies/signedCookies";
import "server-only";

import { prisma } from "../../prisma";

const checkIfLoggedInUserHasAnyPermission = async ({
  roles,
  roleGroups,
}: {
  roles?: Role[];
  roleGroups?: RoleGroup[];
}) => {
  try {
    try {
      const permissionsCookieValue = await getSignedCookieValue("permissions");
      if (!permissionsCookieValue) {
        throw new Error();
      }
      const permissions = JSON.parse(permissionsCookieValue) as Role[];

      const hasPermission = checkIfRolesArrayContainsAny(permissions, {
        roles,
        roleGroups,
      });
      if (!hasPermission) {
        throw new PermissionError("User does not have any required permission");
      }
    } catch (e) {
      if (e instanceof PermissionError) {
        throw e;
      }
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
      await setSignedCookie("permissions", JSON.stringify(user.roles), {
        maxAge: 60 * 60 * 24,
      });
      const hasPermission = checkIfRolesArrayContainsAny(user.roles, {
        roles,
        roleGroups,
      });
      if (!hasPermission) {
        throw new PermissionError("User does not have any required permission");
      }
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
    try {
      const permissionsCookieValue = await getSignedCookieValue("permissions");
      if (!permissionsCookieValue) {
        throw new Error();
      }
      const permissions = JSON.parse(permissionsCookieValue) as Role[];

      const hasPermission = checkIfRolesArrayContainsAny(permissions, {
        roles,
        roleGroups,
      });
      if (!hasPermission) {
        throw new PermissionError("User does not have any required permission");
      }
    } catch (e) {
      if (e instanceof PermissionError) {
        throw e;
      }
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
      await setSignedCookie("permissions", JSON.stringify(user.roles), {
        maxAge: 60 * 60 * 24,
      });
      const hasPermission = checkIfRolesArrayContainsAll(user.roles, {
        roles,
        roleGroups,
      });
      if (!hasPermission) {
        throw new PermissionError("User does not have any required permission");
      }
    }
  } catch (error) {
    if (error instanceof PermissionError) {
      throw error;
    }
    throw new PermissionError("Error checking permissions");
  }
};

export {
  checkIfLoggedInUserHasAnyPermission,
  checkIfLoggedInUserHasAllPermissions,
};
