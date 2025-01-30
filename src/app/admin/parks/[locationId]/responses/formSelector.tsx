import { fetchForms } from "@/serverActions/formUtil";
import "@/serverActions/locationUtil";
import { Form, Location } from "@prisma/client";
import Link from "next/link";

const FormSelector = async ({ location }: { location: Location }) => {
  const allForms: Form[] = await fetchForms();

  return (
    <div className="h-full overflow-auto rounded-lg">
      <h2 className="mb-1 p-2 text-2xl font-bold text-white">
        Escolha o formulário para ver as respostas
      </h2>
      {allForms.length > 0 ?
        <div className="flex flex-col gap-2">
          {allForms.map((form) => (
            <Link
              key={form.id}
              className="rounded-md bg-transparent p-2 text-xl text-white hover:bg-transparent/10 hover:underline"
              href={`/admin/parks/${location.id}/responses/${form.id}`}
            >
              {form.name} Versão {form.version}
            </Link>
          ))}
        </div>
      : <div className="text-redwood">Ainda não há formulários!</div>}
    </div>
  );
};

export { FormSelector };
