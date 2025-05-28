"use client";

import { Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import {
  RoleGroup,
  checkIfRolesArrayContainsAll,
  checkIfRolesArrayContainsAny,
} from "../../lib/auth/rolesUtil";
import { useUserContext } from "../context/UserContext";

const PermissionGuard = ({
  requiresAnyRoleGroups,
  requiresAnyRoles,
  requiresAllRolesGroups,
  requiredAllRoles,
  redirect,
  children,
}: {
  requiresAnyRoleGroups?: RoleGroup[];
  requiresAnyRoles?: Role[];
  requiresAllRolesGroups?: RoleGroup[];
  requiredAllRoles?: Role[];
  redirect?: boolean;
  children: React.ReactNode;
}) => {
  const { user } = useUserContext();
  const router = useRouter();
  const userHasAccess = useMemo(() => {
    const userHasAccessAny = checkIfRolesArrayContainsAny(user.roles, {
      roleGroups: requiresAnyRoleGroups,
      roles: requiresAnyRoles,
    });
    const userHasAccessAll = checkIfRolesArrayContainsAll(user.roles, {
      roleGroups: requiresAllRolesGroups,
      roles: requiredAllRoles,
    });
    return userHasAccessAll && userHasAccessAny;
  }, [
    user,
    requiredAllRoles,
    requiresAllRolesGroups,
    requiresAnyRoleGroups,
    requiresAnyRoles,
  ]);

  useEffect(() => {
    if (!userHasAccess && redirect) {
      router.replace("/error");
    }
  }, [userHasAccess, router, redirect]);

  if (userHasAccess) {
    return <>{children}</>;
  } else {
    return null;
  }
};

export default PermissionGuard;
