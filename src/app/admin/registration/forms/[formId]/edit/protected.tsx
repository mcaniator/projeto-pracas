import { getCategories } from "@queries/category";
import { getFormTree } from "@queries/form";

import ClientV2 from "./clientV2";

const Edit = async (props: { params: Promise<{ formId: string }> }) => {
  const params = await props.params;
  const response = await getFormTree(Number(params.formId));
  const categories = await getCategories();
  if (response.formTree)
    return (
      <ClientV2
        formId={parseInt(params.formId)}
        form={response}
        categories={categories}
      />
    );
  else return <div>Formulário não encontrado</div>;
};
export default Edit;
