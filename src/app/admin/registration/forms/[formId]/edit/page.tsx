import { getCategories } from "@/serverActions/categorySubmit";
import { searchFormById } from "@/serverActions/formUtil";

import Client from "./client";

const Edit = async ({ params }: { params: { formId: string } }) => {
  const form = await searchFormById(parseInt(params.formId));
  const categories = await getCategories();
  if (form) return <Client form={form} categories={categories} />;
};
export default Edit;
