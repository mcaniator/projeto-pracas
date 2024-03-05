import { Button } from "@/components/ui/button";
import { searchFormsById } from "@/serverActions/formUtil";
import { searchQuestionsByFormId } from "@/serverActions/questionSubmit";
import Link from "next/link";

const Page = async ({ params }: { params: { formId: string } }) => {
  const form = await searchFormsById(parseInt(params.formId));
  const formIdNumber = parseInt(params.formId);
  const questions = await searchQuestionsByFormId(parseInt(params.formId));
  if (form != null && form != undefined)
    return (
      <div>
        <div className={"flex min-h-0 flex-grow gap-5 p-5"}>
          <div className="flex basis-3/5 flex-col gap-5 text-white">
            <div
              className={
                "flex basis-1/5 flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 shadow-md"
              }
            >
              <div className="flex">
                <h3 className={"text-2xl font-semibold "}>
                  Informações de {form?.name}
                </h3>
                <Link
                  href={`/admin/parks/${formIdNumber}/edit`}
                  className="ml-auto"
                >
                  <Button>Editar</Button>
                </Link>
              </div>
              <span>Nome: {form?.name}</span>
              <ul>Perguntas</ul>
              {questions !== null ?
                <div className="w-full">
                  {questions.map((question) => (
                    <div key={question.id}>{question.name}</div>
                  ))}
                </div>
              : <p>Loading forms...</p>}
            </div>
          </div>
        </div>
      </div>
    );
  else return <div>Local não encontrado</div>;
};

export default Page;
