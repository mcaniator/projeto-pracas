"use client";

import { Role } from "@prisma/client";

import { RoleGroup, userHasAnyRoles } from "../../lib/auth/rolesUtil";
import { useUserContext } from "../context/UserContext";

const PermissionGuard = ({
  requiresAnyRoleGroups,
  requiresAnyRoles,
  children,
}: {
  requiresAnyRoleGroups?: RoleGroup[];
  requiresAnyRoles?: Role[];
  children: React.ReactNode;
}) => {
  const { user } = useUserContext();
  const userHasAccess = userHasAnyRoles(user.roles, {
    roleGroups: requiresAnyRoleGroups,
    roles: requiresAnyRoles,
  });
  if (userHasAccess) {
    return <>{children}</>;
  }
};

export default PermissionGuard;
