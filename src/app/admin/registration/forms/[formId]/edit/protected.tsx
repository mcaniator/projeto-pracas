import { getCategories } from "@queries/category";
import { getFormTree } from "@queries/form";

import ClientV2 from "./clientV2";

const Edit = async (props: { params: Promise<{ formId: string }> }) => {
  const params = await props.params;
  const response = await getFormTree(Number(params.formId));
  const dbFormTree = response.formTree;
  const categories = await getCategories();
  console.log("DB FORM TREE", dbFormTree);
  if (dbFormTree)
    return <ClientV2 dbFormTree={dbFormTree} categories={categories} />;
};
export default Edit;
