import PermissionGuard from "@components/auth/permissionGuard";
import { ReactNode } from "react";

const TallysLayout = ({ children }: { children: ReactNode }) => {
  return (
    <PermissionGuard
      redirect
      requiresAnyRoles={["TALLY_EDITOR", "TALLY_MANAGER"]}
    >
      {children}
    </PermissionGuard>
  );
};

export default TallysLayout;
