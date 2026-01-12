import PermissionGuard from "@components/auth/permissionGuard";

import InvitesClient from "./invitesClient";

const Invites = () => {
  return (
    <PermissionGuard requiresAnyRoles={["USER_MANAGER"]} redirect>
      <InvitesClient />
    </PermissionGuard>
  );
};

export default Invites;
