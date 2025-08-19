import { Location } from "@prisma/client";
import { fetchFormsLatest } from "@queries/form";
import "@serverActions/locationUtil";
import Link from "next/link";

const FormSelector = async ({ location }: { location: Location }) => {
  const response = await fetchFormsLatest();
  const forms = response.forms;

  return (
    <div className="flex h-full flex-col overflow-auto rounded-lg bg-gray-300/30">
      <h2 className="mb-1 p-2 text-2xl font-bold">
        Escolha o formulário para ver as respostas
      </h2>

      {forms.length > 0 ?
        <div className="flex h-full w-full flex-col overflow-auto rounded-lg">
          {forms.map((form, index) => (
            <Link
              key={form.id}
              className={`p-2 ${index % 2 === 0 ? "bg-gray-400/70" : "bg-gray-400/50"} text-xl hover:bg-transparent/10 hover:underline`}
              href={`/admin/parks/${location.id}/responses/${form.id}`}
            ></Link>
          ))}
        </div>
      : <div className="text-redwood">Ainda não há formulários!</div>}
    </div>
  );
};

export { FormSelector };
