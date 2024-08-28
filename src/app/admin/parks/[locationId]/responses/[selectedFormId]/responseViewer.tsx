import { fetchAssessmentsByLocationAndForm } from "@/serverActions/assessmentUtil";
import { searchQuestionsByFormId } from "@/serverActions/questionSubmit";
import { searchOptionsByQuestionId } from "@/serverActions/questionUtil";
import {
  searchResponsesByQuestionFormLocation,
  searchResponsesOptionsByQuestionFormLocation,
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
  const assessments = await fetchAssessmentsByLocationAndForm(
    locationId,
    formId,
  );
  if (questions === null) {
    return (
      <div className="text-redwood">Ainda não há perguntas no formulário</div>
    );
  }

  const responses = await Promise.all(
    questions.map(async (question) => {
      if (question.type === QuestionTypes.OPTIONS) {
        const options = await searchResponsesOptionsByQuestionFormLocation(
          question.id,
          formId,
          locationId,
        );
        return options.map((option) => ({
          id: option.id,
          type: question.type,
          locationId: locationId,
          formId: formId,
          formVersion: option.formVersion,
          userId: option.userId,
          username: option.user.username,
          questionId: question.id,
          response: option.optionId ? option.optionId.toString() : null,
          optionId: option.optionId,
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
          locationId: locationId,
          formId: formId,
          formVersion: response.formVersion,
          userId: response.userId,
          username: response.user.username,
          questionId: question.id,
          response: response.response,
          createdAt: response.createdAt,
          optionId: null,
        }));
      }
    }),
  );

  const flattenedResponses = responses.flat();

  const groupedResponses = flattenedResponses.reduce(
    (acc, response) => {
      const dateKey = new Date(response.createdAt).toISOString();
      const userId = response.userId;
      if (!acc[`${dateKey},${userId}`]) {
        acc[`${dateKey},${userId}`] = [];
      }
      acc[`${dateKey},${userId}`]?.push(response);
      return acc;
    },
    {} as { [key: string]: typeof flattenedResponses },
  );
  //console.log(groupedResponses);
  const envios = Object.keys(groupedResponses).map((key) => ({
    envioId: key,
    responses: groupedResponses[key] || [],
  }));
  //console.log(envios);
  const options = await Promise.all(
    questions.map(async (question) => {
      if (question.type === QuestionTypes.OPTIONS) {
        const options = await searchOptionsByQuestionId(question.id);
        const responseFrequencies = flattenedResponses
          .filter((response) => response.questionId === question.id)
          .reduce(
            (acc, response) => {
              if (response.optionId) {
                if (!acc[response.optionId]) {
                  acc[response.optionId] = 0;
                }
                const currentEntry = acc[response.optionId];
                if (currentEntry !== undefined)
                  acc[response.optionId] = currentEntry + 1;
              }
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
      <div className="flex max-h-96 basis-3/5 flex-col gap-5 overflow-auto text-white">
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
