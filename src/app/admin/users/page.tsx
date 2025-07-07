import PermissionGuard from "@components/auth/permissionGuard";

import UsersClient from "./usersClient";

const Users = () => {
  return (
    <PermissionGuard requiresAnyRoleGroups={["USER"]} redirect>
      <div className="flex h-full w-full gap-5">
        <div className="flex h-full w-full flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 shadow-md">
          <UsersClient />
        </div>
      </div>
    </PermissionGuard>
  );
};

export default Users;
