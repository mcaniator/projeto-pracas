import UsersClient from "@/app/admin/users/usersClient";
import PermissionGuard from "@components/auth/permissionGuard";

const Users = () => {
  return (
    <PermissionGuard requiresAnyRoleGroups={["USER"]} redirect>
      <UsersClient />
    </PermissionGuard>
  );
};

export default Users;
