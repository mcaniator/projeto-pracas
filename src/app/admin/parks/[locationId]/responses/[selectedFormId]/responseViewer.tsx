import { searchQuestionsByFormId } from "@/serverActions/questionSubmit";
import { searchResponsesByQuestionFormLocation } from "@/serverActions/responseUtil";

import { ResponseViewerClient } from "./responseViewerClient";

const ResponseViewer = async ({
  locationId,
  formId,
}: {
  locationId: number;
  formId: number;
}) => {
  const questions = await searchQuestionsByFormId(formId);
  if (questions === null) {
    return (
      <div className="text-redwood">Ainda não há perguntas no formulário</div>
    );
  }
  const responses = await Promise.all(
    questions.map((question) =>
      searchResponsesByQuestionFormLocation(question.id, formId, locationId),
    ),
  );

  const flattenedResponses = responses.flat();

  return (
    <div className={"flex min-h-0 flex-grow gap-5 p-5"}>
      <div className="flex basis-3/5 flex-col gap-5 text-white">
        <ResponseViewerClient
          questions={questions}
          responses={flattenedResponses}
        />
      </div>
    </div>
  );
};

export { ResponseViewer };
