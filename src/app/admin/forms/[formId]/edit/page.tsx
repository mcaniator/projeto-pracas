import { searchFormsById } from "@/serverActions/formUtil";

import { FormUpdater } from "./formUpdater";

const Edit = async ({ params }: { params: { formId: string } }) => {
  const form = await searchFormsById(parseInt(params.formId));

  // TODO: add error handling
  return form == null ?
      <div>Formulário não encontrado</div>
    : <FormUpdater form={form} />;
};
export default Edit;
