import { getCategories } from "@queries/category";
import { searchFormById } from "@queries/form";

import Client from "./client";

const Edit = async (props: { params: Promise<{ formId: string }> }) => {
  const params = await props.params;
  const response = await searchFormById(parseInt(params.formId));
  const form = response.form;
  const categories = await getCategories();
  if (form) return <Client form={form} categories={categories} />;
};
export default Edit;
