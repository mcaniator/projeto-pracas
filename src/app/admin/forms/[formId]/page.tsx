import { Button } from "@/components/button";
import { searchFormsById } from "@/serverActions/formUtil";
import { searchQuestionsByFormId } from "@/serverActions/questionUtil";
import Link from "next/link";

const Page = async ({ params }: { params: { formId: string } }) => {
  const form = await searchFormsById(parseInt(params.formId));
  const formIdNumber = parseInt(params.formId);
  //const questions = await searchQuestionsByFormId(parseInt(params.formId));
  const questions = await searchQuestionsByFormId(Number(params.formId));
  const categories: {
    id: number;
    name: string;
    questions: { id: number; name: string }[];
    subcategories: {
      id: number;
      name: string;
      categoryId: number;
      questions: { id: number; name: string }[];
    }[];
  }[] = [];

  questions.forEach((question) => {
    let categoryGroup = categories.find(
      (category) => category.id === question.category.id,
    );
    if (!categoryGroup) {
      categoryGroup = {
        id: question.category.id,
        name: question.category.name,

        subcategories: [],
        questions: [],
      };
      categories.push(categoryGroup);
    }
    if (question.subcategory) {
      let subcategoryGroup = categoryGroup.subcategories.find(
        (subcategory) => subcategory.id === question.subcategory?.id,
      );
      if (!subcategoryGroup) {
        subcategoryGroup = {
          id: question.subcategory.id,
          name: question.subcategory.name,
          categoryId: question.subcategory.categoryId,

          questions: [],
        };
        categoryGroup.subcategories.push(subcategoryGroup);
      }
      subcategoryGroup.questions.push({
        id: question.id,
        name: question.name,
      });
    } else {
      categoryGroup.questions.push({
        id: question.id,
        name: question.name,
      });
    }
  });
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
                <h3 className={"text-2xl font-semibold"}>
                  Informações de {form?.name}
                </h3>
                <Link
                  href={`/admin/forms/${formIdNumber}/edit`}
                  className="ml-auto"
                >
                  <Button>Editar</Button>
                </Link>
              </div>
              <span>Versão: {form?.version}</span>
              <div>Perguntas do formulário:</div>
              {categories.map((category) => {
                return (
                  <div
                    key={category.id}
                    className="rounded-3xl bg-gray-400/20 p-3 text-white shadow-inner"
                  >
                    <h4 className="text-2xl">{category.name}</h4>
                    <ul className="list-disc p-3">
                      {category.questions.map((question) => (
                        <li key={question.id}>{question.name}</li>
                      ))}
                    </ul>
                    {category.subcategories.map((subcategory) => {
                      return (
                        <div key={subcategory.id}>
                          <h5 className="text-xl">{subcategory.name}</h5>
                          <ul className="list-disc p-3">
                            {subcategory.questions.map((question) => (
                              <li key={question.id}>{question.name}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  else return <div>Local não encontrado</div>;
};

export default Page;
