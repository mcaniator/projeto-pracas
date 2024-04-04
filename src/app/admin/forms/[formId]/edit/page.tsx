import { QuestionForm } from "@/components/singleUse/admin/question/questionForm";
import { searchFormsById } from "@/serverActions/formUtil";

import { FormUpdater } from "./formUpdater";

const Edit = async ({ params }: { params: { formId: string } }) => {
  const form = await searchFormsById(parseInt(params.formId));

  // TODO: add error handling
  return form == null ?
      <div>Formulário não encontrado</div>
    : <div className="flex">
        <div className="w-1/2">
          <FormUpdater form={form} />
        </div>
        <div className="w-1/2">
          <QuestionForm formId={form.id} />
        </div>
      </div>;
};
export default Edit;
