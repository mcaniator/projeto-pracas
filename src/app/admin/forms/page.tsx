import PermissionGuard from "@components/auth/permissionGuard";
import { fetchFormsLatest } from "@queries/form";

import FormsClient from "./client";
import { FormCreationModal } from "./formCreationModal";
import FormsTable from "./formsTable";

const AdminRoot = async () => {
  const response = await fetchFormsLatest();
  const forms = response.forms;
  return (
    <div
      className={
        "flex h-full min-h-0 w-full flex-col gap-5 overflow-auto bg-white p-2"
      }
    >
      <h3 className="text-4xl font-semibold text-black">Formulários</h3>
      <PermissionGuard requiresAnyRoles={["FORM_MANAGER"]}>
        <div>
          <FormCreationModal />
        </div>
      </PermissionGuard>
      <div>
        {forms.length > 0 ?
          <FormsTable forms={forms} />
        : <div className="text-red-500">Ainda não há formulários!</div>}
      </div>

      <FormsClient />
    </div>
  );
};

export default AdminRoot;
