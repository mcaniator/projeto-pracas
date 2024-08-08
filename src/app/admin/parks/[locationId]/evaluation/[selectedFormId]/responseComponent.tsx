import { ResponseForm } from "@/components/singleUse/admin/response/responseForm";
import { searchQuestionsByFormId } from "@/serverActions/questionSubmit";
import { searchOptionsByQuestionId } from "@/serverActions/questionUtil";
import { QuestionTypes } from "@prisma/client";

const ResponseComponent = async ({
  locationId,
  formId,
  formVersion,
  userId,
}: {
  locationId: number;
  formId: number;
  formVersion: number;
  userId: string;
}) => {
  const questions = await searchQuestionsByFormId(formId);

  if (questions === null) return null;
  const options = await Promise.all(
    questions.map(async (question) => {
      if (question.type === QuestionTypes.OPTIONS) {
        const options = await searchOptionsByQuestionId(question.id);
        return { questionId: question.id, options };
      }
      return { questionId: question.id, options: [] };
    }),
  );

  return (
    <div className={"flex min-h-0 flex-grow gap-5 p-5"}>
      <div className="flex basis-3/5 flex-col gap-5 text-white">
        <ResponseForm
          locationId={locationId}
          formId={formId}
          formVersion={formVersion}
          questions={questions}
          options={options}
          userId={userId}
        />
      </div>
    </div>
  );
};

export { ResponseComponent };
