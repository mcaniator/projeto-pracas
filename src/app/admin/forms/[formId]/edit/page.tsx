import { searchFormsById } from "@/serverActions/formUtil";
import { searchQuestionsByFormId } from "@/serverActions/questionSubmit";

import Client from "./client";

const Edit = async ({ params }: { params: { formId: string } }) => {
  const form = await searchFormsById(parseInt(params.formId));
  const questions = await searchQuestionsByFormId(parseInt(params.formId));
  // TODO: add error handling
  return <Client form={form} questions={questions} />;
};
export default Edit;
