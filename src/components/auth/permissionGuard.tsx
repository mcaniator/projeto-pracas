import { Role } from "@prisma/client";

import { RoleGroup, userHasAnyRoles } from "../../lib/auth/rolesUtil";

const PermissionGuard = ({
  userRoles,
  requiresAnyRoleGroups,
  requiresAnyRoles,
  children,
}: {
  userRoles: Role[];
  requiresAnyRoleGroups?: RoleGroup[];
  requiresAnyRoles?: Role[];
  children: React.ReactNode;
}) => {
  const userHasAccess = userHasAnyRoles(userRoles, {
    roleGroups: requiresAnyRoleGroups,
    roles: requiresAnyRoles,
  });
  if (userHasAccess) {
    return <>{children}</>;
  }
};

export default PermissionGuard;
