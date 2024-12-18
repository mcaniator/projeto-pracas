import { Button } from "@/components/button";
import { searchFormById } from "@/serverActions/formUtil";
import Link from "next/link";

import { FormVersionDeletionModal } from "./formVersionDeletionModal";

const Page = async ({ params }: { params: { formId: string } }) => {
  const form = await searchFormById(parseInt(params.formId));
  const formIdNumber = parseInt(params.formId);
  //const questions = await searchQuestionsByFormId(parseInt(params.formId));
  //const questions = await searchQuestionsByFormId(Number(params.formId));
  const categories: {
    id: number;
    name: string;
    questions: { id: number; name: string }[];
    calculations: { id: number; name: string }[];
    subcategories: {
      id: number;
      name: string;
      categoryId: number;
      questions: { id: number; name: string }[];
      calculations: { id: number; name: string }[];
    }[];
  }[] = [];
  if (form) {
    form.questions.forEach((question) => {
      let categoryGroup = categories.find(
        (category) => category.id === question.category.id,
      );
      if (!categoryGroup) {
        categoryGroup = {
          id: question.category.id,
          name: question.category.name,

          subcategories: [],
          questions: [],
          calculations: [],
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
            calculations: [],
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
    form.calculations.forEach((calculation) => {
      const categoryGroup = categories.find(
        (category) => category.id === calculation.category.id,
      );

      if (calculation.subcategory) {
        const subcategoryGroup = categoryGroup?.subcategories.find(
          (subcategory) => subcategory.id === calculation.subcategory?.id,
        );

        subcategoryGroup?.calculations.push({
          id: calculation.id,
          name: calculation.name,
        });
      } else {
        categoryGroup?.calculations.push({
          id: calculation.id,
          name: calculation.name,
        });
      }
    });
  }

  if (form != null && form != undefined)
    return (
      <div className="overflow-auto">
        <div className={"flex min-h-0 flex-grow gap-5 p-5"}>
          <div className="flex w-full flex-col gap-5 text-white">
            <div
              className={
                "flex flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 shadow-md"
              }
            >
              <div className="flex flex-col sm:flex-row">
                <h3 className={"text-2xl font-semibold sm:text-3xl"}>
                  {form?.name}
                </h3>
                <div className="flex gap-2 sm:w-full">
                  <Link
                    href={`/admin/registration/forms/${formIdNumber}/edit`}
                    className="sm:ml-auto"
                  >
                    <Button className="w-fit items-center p-2 text-sm sm:text-xl">
                      Editar
                    </Button>
                  </Link>
                  <FormVersionDeletionModal
                    formId={form.id}
                    formName={form.name}
                    formVersion={form.version}
                  />
                </div>
              </div>
              <span>Versão: {form?.version}</span>
              <div>Perguntas do formulário:</div>
              <div className="flex flex-col gap-3">
                {categories.map((category) => {
                  return (
                    <div
                      key={category.id}
                      className="rounded-3xl bg-gray-400/20 p-3 text-white shadow-md"
                    >
                      <h4 className="text-2xl">{category.name}</h4>
                      <ul className="list-disc p-3">
                        {category.questions.map((question) => (
                          <li key={question.id} className="py-3">
                            {question.name}
                          </li>
                        ))}
                      </ul>
                      <h6>{category.calculations.length > 0 && "Cálculos"}</h6>
                      <ul className="list-disc px-8 py-3">
                        {category.calculations.map((calculation) => (
                          <li key={calculation.id}>{calculation.name}</li>
                        ))}
                      </ul>
                      {category.subcategories.map((subcategory) => {
                        return (
                          <div
                            key={subcategory.id}
                            className="my-2 rounded-md bg-gray-500/40 p-2 shadow-inner"
                          >
                            <h5 className="text-xl">{subcategory.name}</h5>
                            <ul className="list-disc p-3">
                              {subcategory.questions.map((question) => (
                                <li key={question.id}>{question.name}</li>
                              ))}
                            </ul>
                            <h6>
                              {subcategory.calculations.length > 0 &&
                                "Cálculos"}
                            </h6>
                            <ul className="list-disc px-8 py-3">
                              {subcategory.calculations.map((calculation) => (
                                <li key={calculation.id}>{calculation.name}</li>
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
      </div>
    );
  else return <div>Local não encontrado</div>;
};

export default Page;
