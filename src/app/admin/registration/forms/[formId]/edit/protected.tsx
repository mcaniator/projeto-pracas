import { getCategories } from "@queries/category";
import { searchFormById } from "@queries/form";

import Client from "./client";
import ClientV2 from "./clientV2";

const Edit = async (props: { params: Promise<{ formId: string }> }) => {
  const params = await props.params;
  const response = await searchFormById(Number(params.formId));
  const form = response.form;
  const categories = await getCategories();
  const v2 = true;
  if (form)
    return v2 ?
        <ClientV2 form={form} categories={categories} />
      : <Client form={form} categories={categories} />;
};
export default Edit;
