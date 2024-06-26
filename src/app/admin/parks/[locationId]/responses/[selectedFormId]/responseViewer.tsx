import { searchQuestionsByFormId } from "@/serverActions/questionSubmit";
import { searchOptionsByQuestionId } from "@/serverActions/questionUtil";
import {
  searchResponsesByQuestionFormLocation,
  searchResponsesOptionsByQuestionId,
} from "@/serverActions/responseUtil";
import { QuestionTypes } from "@prisma/client";

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
    questions.map(async (question) => {
      if (question.type === QuestionTypes.OPTIONS) {
        const options = await searchResponsesOptionsByQuestionId(question.id);
        return options.map((option) => ({
          id: option.id,
          type: question.type,
          frequency: option.frequency,
          locationId: locationId,
          formId: formId,
          questionId: question.id,
          response: null,
          createdAt: option.createdAt,
        }));
      } else {
        const responses = await searchResponsesByQuestionFormLocation(
          question.id,
          formId,
          locationId,
        );
        return responses.map((response) => ({
          id: response.id,
          type: question.type,
          frequency: response.frequency,
          locationId: locationId,
          formId: formId,
          questionId: question.id,
          response: response.response,
          createdAt: response.createdAt,
        }));
      }
    }),
  );

  const flattenedResponses = responses.flat();

  const groupedResponses = flattenedResponses.reduce(
    (acc, response) => {
      const dateKey = new Date(response.createdAt).toISOString().slice(0, 16);
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey]?.push(response);
      return acc;
    },
    {} as { [key: string]: typeof flattenedResponses },
  );

  const envios = Object.keys(groupedResponses).map((key) => ({
    envioId: key,
    responses: groupedResponses[key] || [],
  }));

  const options = await Promise.all(
    questions.map(async (question) => {
      if (question.type === QuestionTypes.OPTIONS) {
        const options = await searchOptionsByQuestionId(question.id);
        const responseFrequencies = flattenedResponses
          .filter((response) => response.questionId === question.id)
          .reduce(
            (acc, response) => {
              acc[response.id] = response.frequency;
              return acc;
            },
            {} as { [key: number]: number },
          );

        return {
          questionId: question.id,
          options: options.map((option) => ({
            id: option.id,
            text: option.text,
            frequency: responseFrequencies[option.id] || 0,
          })),
        };
      }
      return { questionId: question.id, options: [] };
    }),
  );

  return (
    <div className={"flex min-h-0 flex-grow gap-5 p-5"}>
      <div className="flex basis-3/5 flex-col gap-5 text-white">
        <ResponseViewerClient
          questions={questions}
          options={options}
          responses={flattenedResponses}
          envios={envios}
          locationId={locationId}
          formId={formId}
        />
      </div>
    </div>
  );
};

export { ResponseViewer };
