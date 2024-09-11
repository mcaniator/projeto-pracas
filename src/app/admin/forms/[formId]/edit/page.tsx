import { getCategories } from "@/serverActions/categorySubmit";
import { searchFormsById } from "@/serverActions/formUtil";
import { searchQuestionsByFormId } from "@/serverActions/questionSubmit";

import Client from "./client";

const Edit = async ({ params }: { params: { formId: string } }) => {
  const form = await searchFormsById(parseInt(params.formId));
  const questions =
    (await searchQuestionsByFormId(parseInt(params.formId))) ?? [];
  const categories = await getCategories();
  categories.sort((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });
  categories.forEach((category) => {
    category.subcategory.sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });
  });
  // TODO: add error handling
  return <Client form={form} questions={questions} categories={categories} />;
};
export default Edit;
