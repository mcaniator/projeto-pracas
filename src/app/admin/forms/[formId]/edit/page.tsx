import PermissionGuard from "@components/auth/permissionGuard";

import Edit from "./protected";

const EditFormProtected = (props: { params: Promise<{ formId: string }> }) => {
  return (
    <PermissionGuard redirect requiresAnyRoleGroups={["FORM"]}>
      <Edit params={props.params} />
    </PermissionGuard>
  );
};
export default EditFormProtected;
