import PermissionGuard from "@components/auth/permissionGuard";
import { ReactNode } from "react";

const TallysLayout = ({ children }: { children: ReactNode }) => {
  return (
    <PermissionGuard redirect requiresAnyRoleGroups={["TALLY"]}>
      {children}
    </PermissionGuard>
  );
};

export default TallysLayout;
