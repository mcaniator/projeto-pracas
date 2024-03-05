import { FormComponent } from "@/components/singleUse/admin/registration/forms/formComponent";
import { prisma } from "@/lib/prisma";
import { Form } from "@prisma/client";

const AdminRoot = async () => {
  let forms: Form[];
  try {
    forms = await prisma.form.findMany();
  } catch (e) {
    // console.error(e);
    forms = [];
  }
  return (
    <div>
      <div>Clique no formulário para preencher</div>
      {forms !== null ?
        <div className="w-full">
          {forms.map((form) => (
            <FormComponent key={form.id} id={form.id} name={form.name} />
          ))}
        </div>
      : <p>Loading forms...</p>}
    </div>
  );
};

export default AdminRoot;
