import { ReactNode } from "react";

import PermissionGuard from "../../../../components/auth/permissionGuard";

const LocationRegisterLayout = ({ children }: { children: ReactNode }) => {
  return (
    <PermissionGuard requiresAnyRoles={["PARK_MANAGER"]} redirect>
      {children}
    </PermissionGuard>
  );
};

export default LocationRegisterLayout;
