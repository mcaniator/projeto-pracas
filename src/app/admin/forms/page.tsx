import { FormComponent } from "@/components/singleUse/admin/registration/forms/formComponent";
import { fetchFormsLatest } from "@/serverActions/formUtil";
import { Form } from "@prisma/client";

const AdminRoot = async () => {
  const forms: Form[] = await fetchFormsLatest();

  return (
    <div>
      <div>Clique no formulário para visualizar</div>
      {forms.length > 0 ?
        <div className="w-full">
          {forms.map((form) => (
            <FormComponent
              key={form.id}
              id={form.id}
              name={form.name}
              version={form.version}
            />
          ))}
        </div>
      : <div className="text-redwood">Ainda não há perguntas no formulário</div>
      }
    </div>
  );
};

export default AdminRoot;
