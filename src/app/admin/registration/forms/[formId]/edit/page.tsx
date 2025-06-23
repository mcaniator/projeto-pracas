import PermissionGuard from "../../../../../../components/auth/permissionGuard";
import Edit from "./protected";

const EditFormProtected = (props: { params: Promise<{ formId: string }> }) => {
  return (
    <PermissionGuard redirect requiresAnyRoles={["FORM_MANAGER"]}>
      <Edit params={props.params} />
    </PermissionGuard>
  );
};
export default EditFormProtected;
