import { NavBar } from "@/components/singleUse/admin/registration/navBar";
import PermissionGuard from "@components/auth/permissionGuard";
import { ReactNode } from "react";

const RegistrationLayout = ({ children }: { children: ReactNode }) => {
  return (
    <PermissionGuard requiresAnyRoleGroups={["FORM"]} redirect>
      <div className={"flex h-full flex-col"}>
        <NavBar />
        {children}
      </div>
    </PermissionGuard>
  );
};

export default RegistrationLayout;
