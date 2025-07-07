import { NavBar } from "@/components/singleUse/admin/registration/navBar";
import PermissionGuard from "@components/auth/permissionGuard";
import { ReactNode } from "react";

const RegistrationLayout = ({ children }: { children: ReactNode }) => {
  return (
    <PermissionGuard requiresAnyRoleGroups={["FORM"]} redirect>
      <main className={"flex h-full flex-col"}>
        <NavBar />
        {children}
      </main>
    </PermissionGuard>
  );
};

export default RegistrationLayout;
