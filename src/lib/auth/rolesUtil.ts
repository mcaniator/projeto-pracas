import { Role } from "@prisma/client";

export type AssessmentRole =
  | "ASSESSMENT_VIEWER"
  | "ASSESSMENT_EDITOR"
  | "ASSESSMENT_MANAGER";
export type ParkRole = "PARK_VIEWER" | "PARK_EDITOR" | "PARK_MANAGER";
export type FormRole = "FORM_VIEWER" | "FORM_EDITOR" | "FORM_MANAGER";
export type TallyRole = "TALLY_VIEWER" | "TALLY_EDITOR" | "TALLY_MANAGER";
export type UserRole = "USER_VIEWER" | "USER_MANAGER";

export type RoleGroup = "ASSESSMENT" | "PARK" | "FORM" | "TALLY" | "USER";

export const roleGroupMap: Record<RoleGroup, Role[]> = {
  ASSESSMENT: [
    Role.ASSESSMENT_VIEWER,
    Role.ASSESSMENT_EDITOR,
    Role.ASSESSMENT_MANAGER,
  ],
  PARK: [Role.PARK_VIEWER, Role.PARK_EDITOR, Role.PARK_MANAGER],
  FORM: [Role.FORM_VIEWER, Role.FORM_EDITOR, Role.FORM_MANAGER],
  TALLY: [Role.TALLY_VIEWER, Role.TALLY_EDITOR, Role.TALLY_MANAGER],
  USER: [Role.USER_VIEWER, Role.USER_MANAGER],
};

const userHasAnyRoles = (
  useRoles: Role[],
  { roles, roleGroups }: { roles?: Role[]; roleGroups?: RoleGroup[] },
) => {
  let result = false;
  if (roles) {
    result = useRoles.some((role) => roles.includes(role));
    if (result) return true;
  }
  if (roleGroups) {
    for (const group of roleGroups) {
      const groupRoles = roleGroupMap[group];
      const hasGroupRole = useRoles.some((role) => groupRoles.includes(role));
      if (hasGroupRole) return true;
    }
    return false;
  }
};

export { userHasAnyRoles };
