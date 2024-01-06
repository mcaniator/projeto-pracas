import { FormComponent } from "@/components/singleUse/admin/registration/forms/formComponent";
import { FormForm } from "@/components/singleUse/admin/registration/forms/formForm";
import { prisma } from "@/lib/prisma";
import { Form } from "@prisma/client";

const AdminRoot = async () => {
  let forms: Form[];
  try {
    forms = await prisma.form.findMany();
  } catch (e) {
    console.error(e);
    forms = [];
  }

  return (
    <div className={"flex min-h-0 flex-grow gap-5 p-5"}>
      <div className="flex basis-3/5 flex-col gap-5 text-white">
        <div className={"flex basis-1/5 flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 shadow-md"}>
          <h3 className={"text-2xl font-semibold"}>Criação de Formulários</h3>
          <FormForm />
        </div>
      </div>
      {forms !== null ?
        <div className="w-full">
          {forms.map((form) => (
            <FormComponent key={form.id} id={form.id} nome={form.name} />
          ))}
        </div>
      : <p>Loading forms...</p>}
    </div>
  );
};

export default AdminRoot;
