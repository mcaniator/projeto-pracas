import { ReactNode } from "react";

import PermissionGuard from "../../../../../components/auth/permissionGuard";

const EditParkLayout = ({ children }: { children: ReactNode }) => {
  return (
    <PermissionGuard requiresAnyRoles={["PARK_MANAGER"]} redirect>
      {children}
    </PermissionGuard>
  );
};

export default EditParkLayout;
