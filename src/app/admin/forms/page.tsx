import { FormComponent } from "@/components/singleUse/admin/registration/forms/formComponent";
import { prisma } from "@/lib/prisma";
import { Form } from "@prisma/client";

const AdminRoot = async () => {
  let forms: Form[];
  try {
    forms = await prisma.form.findMany({
      select: {
        id: true,
        name: true,
        version: true,
        createdAt: true,
        updatedAt: true,
      },
      distinct: ["name"],
      orderBy: [
        {
          name: "asc",
        },
        {
          version: "desc",
        },
      ],
    });
  } catch (e) {
    // console.error(e);
    forms = [];
  }
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
