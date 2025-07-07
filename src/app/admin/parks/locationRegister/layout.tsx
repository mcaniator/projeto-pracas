import PermissionGuard from "@components/auth/permissionGuard";
import { ReactNode } from "react";

const LocationRegisterLayout = ({ children }: { children: ReactNode }) => {
  return (
    <PermissionGuard requiresAnyRoles={["PARK_MANAGER"]} redirect>
      {children}
    </PermissionGuard>
  );
};

export default LocationRegisterLayout;
