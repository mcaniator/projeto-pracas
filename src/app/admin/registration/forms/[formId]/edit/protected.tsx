import { getCategories } from "@/serverActions/categoryUtil";
import { searchFormById } from "@/serverActions/formUtil";

import Client from "./client";

const Edit = async (props: { params: Promise<{ formId: string }> }) => {
  const params = await props.params;
  const form = await searchFormById(parseInt(params.formId));
  const categories = await getCategories();
  if (form) return <Client form={form} categories={categories} />;
};
export default Edit;
