import { ReactNode } from "react";

import PermissionGuard from "../../../components/auth/permissionGuard";

const ActivityLayout = ({ children }: { children: ReactNode }) => {
  return (
    <PermissionGuard requiresAnyRoleGroups={["ASSESSMENT", "TALLY"]} redirect>
      {children}
    </PermissionGuard>
  );
};

export default ActivityLayout;
