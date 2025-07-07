import PermissionGuard from "@components/auth/permissionGuard";
import { ReactNode } from "react";

const ActivityLayout = ({ children }: { children: ReactNode }) => {
  return (
    <PermissionGuard requiresAnyRoleGroups={["ASSESSMENT", "TALLY"]} redirect>
      {children}
    </PermissionGuard>
  );
};

export default ActivityLayout;
