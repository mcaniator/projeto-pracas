import { Form } from "@prisma/client";
import { IconListCheck } from "@tabler/icons-react";
import Link from "next/link";

import PermissionGuard from "../../../../components/auth/permissionGuard";
import { fetchFormsLatest } from "../../../../serverActions/formUtil";
import FormsClient from "./client";
import { FormCreationModal } from "./formCreationModal";

const AdminRoot = async () => {
  const forms: Form[] = await fetchFormsLatest();
  return (
    <div className={"flex min-h-0 flex-grow gap-5 overflow-auto"}>
      <div className="flex w-full flex-col gap-5">
        <div
          className={
            "flex flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 shadow-md"
          }
        >
          <PermissionGuard requiresAnyRoles={["FORM_MANAGER"]}>
            <div>
              <FormCreationModal />
            </div>
          </PermissionGuard>
          <div>
            {forms.length > 0 ?
              <div className="flex w-full flex-col">
                {forms.map((form, index) => (
                  <Link
                    key={form.id}
                    className={`${index % 2 === 0 ? "bg-gray-400/70" : "bg-gray-400/50"} p-2 hover:bg-transparent/10 hover:underline`}
                    href={`/admin/registration/forms/${form.id}`}
                  >
                    <IconListCheck className="mb-1 inline" size={24} />
                    <span className="inline">{`${form.name}, versão ${form.version}`}</span>
                  </Link>
                ))}
              </div>
            : <div className="text-red-500">Ainda não há formulários!</div>}
          </div>
        </div>
      </div>
      <FormsClient />
    </div>
  );
};

export default AdminRoot;
