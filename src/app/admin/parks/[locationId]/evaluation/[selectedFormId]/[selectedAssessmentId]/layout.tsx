import PermissionGuard from "@components/auth/permissionGuard";
import { ReactNode } from "react";

const AssessmentInProgressLayout = ({ children }: { children: ReactNode }) => {
  return (
    <PermissionGuard
      requiresAnyRoles={["ASSESSMENT_EDITOR", "ASSESSMENT_MANAGER"]}
      redirect
    >
      {children}
    </PermissionGuard>
  );
};

export default AssessmentInProgressLayout;
