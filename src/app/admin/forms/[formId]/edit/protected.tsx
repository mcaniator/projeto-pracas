import { getCalculationByFormId, getFormTree } from "@queries/form";

import ClientV2 from "./clientV2";

const Edit = async (props: { params: Promise<{ formId: string }> }) => {
  const params = await props.params;
  const response = await getFormTree(Number(params.formId));
  const calculations = await getCalculationByFormId(Number(params.formId));
  if (response.formTree)
    return (
      <ClientV2
        formId={parseInt(params.formId)}
        form={response}
        dbCalculations={calculations.calculations}
      />
    );
  else return <div>Formulário não encontrado</div>;
};
export default Edit;
