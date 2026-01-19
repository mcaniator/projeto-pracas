import { Role } from "@prisma/client";

export type AssessmentRole =
  | "ASSESSMENT_VIEWER"
  | "ASSESSMENT_EDITOR"
  | "ASSESSMENT_MANAGER";
export type ParkRole = "PARK_VIEWER" | "PARK_MANAGER";
export type FormRole = "FORM_VIEWER" | "FORM_MANAGER";
export type TallyRole = "TALLY_VIEWER" | "TALLY_EDITOR" | "TALLY_MANAGER";
export type UserRole = "USER_VIEWER" | "USER_MANAGER";

export type RoleGroup = "ASSESSMENT" | "PARK" | "FORM" | "TALLY" | "USER";

export const roleGroupMap: Record<RoleGroup, Role[]> = {
  ASSESSMENT: [
    Role.ASSESSMENT_VIEWER,
    Role.ASSESSMENT_EDITOR,
    Role.ASSESSMENT_MANAGER,
  ],
  PARK: [Role.PARK_VIEWER, Role.PARK_MANAGER],
  FORM: [Role.FORM_VIEWER, Role.FORM_MANAGER],
  TALLY: [Role.TALLY_VIEWER, Role.TALLY_EDITOR, Role.TALLY_MANAGER],
  USER: [Role.USER_VIEWER, Role.USER_MANAGER],
};

const checkIfRolesArrayContainsAny = (
  userRoles: Role[],
  { roles, roleGroups }: { roles?: Role[]; roleGroups?: RoleGroup[] },
) => {
  let rolesResult = true;
  let roleGroupsResult = true;
  if (roles) {
    rolesResult = userRoles.some((role) => roles.includes(role));
  }
  if (roleGroups) {
    for (const group of roleGroups) {
      const groupRoles = roleGroupMap[group];
      const hasGroupRole = userRoles.some((role) => groupRoles.includes(role));
      if (hasGroupRole) {
        roleGroupsResult = true;
        break;
      }
      roleGroupsResult = false;
    }
  }
  return rolesResult && roleGroupsResult;
};

const checkIfRolesArrayContainsAll = (
  userRoles: Role[],
  { roles, roleGroups }: { roles?: Role[]; roleGroups?: RoleGroup[] },
) => {
  let rolesResult = true;
  let roleGroupsResult = true;
  if (roles) {
    rolesResult = roles.every((role) => userRoles.includes(role));
  } else {
    rolesResult = true;
  }
  if (roleGroups) {
    for (const group of roleGroups) {
      const groupRoles = roleGroupMap[group];
      const hasGroupRole = groupRoles.every((role) => userRoles.includes(role));
      if (!hasGroupRole) {
        roleGroupsResult = false;
        break;
      }
    }
  } else {
    roleGroupsResult = true;
  }

  return rolesResult && roleGroupsResult;
};

const getRoleForGroup = (
  userRoles: Role[] | null | undefined,
  roleGroup: RoleGroup,
) => {
  if (!userRoles) return null;
  const groupRoles = roleGroupMap[roleGroup];

  for (let i = groupRoles.length - 1; i >= 0; i--) {
    const role = groupRoles[i];
    if (!role) {
      continue;
    }
    if (userRoles.includes(role)) {
      return role;
    }
  }

  return null;
};

export {
  checkIfRolesArrayContainsAny,
  checkIfRolesArrayContainsAll,
  getRoleForGroup,
};
