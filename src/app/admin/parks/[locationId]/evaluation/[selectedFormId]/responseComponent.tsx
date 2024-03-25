import { ResponseForm } from "@/components/singleUse/admin/response/responseForm";
import { searchQuestionsByFormId } from "@/serverActions/questionSubmit";

const ResponseComponent = async ({
  locationId,
  formId,
}: {
  locationId: number;
  formId: number;
}) => {
  const questions = await searchQuestionsByFormId(formId);

  return (
    <div className={"flex min-h-0 flex-grow gap-5 p-5"}>
      <div className="flex basis-3/5 flex-col gap-5 text-white">
        <ResponseForm
          locationId={locationId}
          formId={formId}
          questions={questions}
        />
      </div>
    </div>
  );
};
export { ResponseComponent };
