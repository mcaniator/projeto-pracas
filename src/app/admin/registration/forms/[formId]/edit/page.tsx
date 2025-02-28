import { getCategories } from "@/serverActions/categorySubmit";
import { searchFormById } from "@/serverActions/formUtil";

import Client from "./client";

const Edit = async ({ params }: { params: { formId: string } }) => {
  const form = await searchFormById(parseInt(params.formId));
  const categories = await getCategories();
  /*categories.sort((a, b) => {
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
  });*/
  // TODO: add error handling
  if (form) return <Client form={form} categories={categories} />;
};
export default Edit;
