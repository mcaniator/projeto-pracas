import { Form } from "@prisma/client";

import { FormComponent } from "../../../../components/singleUse/admin/registration/forms/formComponent";
import { fetchFormsLatest } from "../../../../serverActions/formUtil";
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
          <div>
            <FormCreationModal />
          </div>

          <div>
            {forms.length > 0 ?
              <div className="w-full text-black">
                {forms.map((form) => (
                  <FormComponent
                    key={form.id}
                    id={form.id}
                    name={form.name}
                    version={form.version}
                  />
                ))}
              </div>
            : <div className="text-red-500">Ainda não há formulários!</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRoot;
