import { fetchLatestNonVersionZeroForms } from "@/serverActions/formUtil";
import Link from "next/link";

const Evaluation = async (props: {
  params: Promise<{ locationId: string }>;
}) => {
  const params = await props.params;
  const formsResponse = await fetchLatestNonVersionZeroForms();
  const forms = formsResponse.forms;
  return (
    <div className={"flex max-h-full min-h-0 flex-col gap-5"}>
      <div className="flex max-h-full flex-col gap-5 overflow-auto rounded-3xl bg-gray-300/30 p-3 shadow-md">
        <h3 className="text-2xl font-semibold">
          Escolha o formulário para avaliar
        </h3>
        {forms.length > 0 ?
          <div className="flex w-full flex-col">
            {forms.map((form, index) => (
              <Link
                key={form.id}
                className={`${index % 2 === 0 ? "bg-gray-400/70" : "bg-gray-400/50"} flex items-center justify-between p-2 hover:bg-transparent/10 hover:underline`}
                href={`/admin/parks/${Number(params.locationId)}/evaluation/${form.id}`}
              >
                {`${form.name}, versão ${form.version}`}
              </Link>
            ))}
          </div>
        : <div className="text-redwood">Ainda não há formulários válidos!</div>}
      </div>
    </div>
  );
};

export default Evaluation;
