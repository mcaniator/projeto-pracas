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
      <div>Clique no formulário para visualizar</div>
      {forms !== null ?
        <div className="w-full">
          {forms.map((form) => (
            <FormComponent key={form.id} id={form.id} name={form.name} />
          ))}
        </div>
      : <div className="text-redwood">Ainda não há perguntas no formulário</div>
      }
    </div>
  );
};

export default AdminRoot;
