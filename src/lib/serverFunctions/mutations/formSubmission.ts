import dayjs from "@/lib/dayjs";
import { BooleanResponseValue } from "@/lib/enums/formSubmissionResponse";
import { prisma } from "@/lib/prisma";
import {
  type FormSubmissionOptionValueWithOverride,
  responseFormGeometrySchema,
  serializedFormValuesSchema,
} from "@/lib/types/formSubmission/responseFormTypes";
import { serializeResponseGeometriesToWkt } from "@/lib/utils/responseGeometry";
import {
  Prisma,
  QuestionResponseCharacterTypes,
  QuestionTypes,
} from "@prisma/client";
import { z } from "zod";

export const formSubmissionDataSchema = z.object({
  responses: serializedFormValuesSchema,
  geometries: z.array(responseFormGeometrySchema),
});

export type FormSubmissionData = z.infer<typeof formSubmissionDataSchema>;

const isSerializedOptionValueWithOverride = (
  response: unknown,
): response is {
  value: number;
  override: string | number | boolean | null;
} => {
  return (
    typeof response === "object" &&
    response !== null &&
    "value" in response &&
    typeof response.value === "number" &&
    "override" in response
  );
};

/**
 * Formats a response value to a FormSubmissionOptionValueWithOverride, even if it's a response option without override possibility
 * @param response
 * @returns
 */
const toOptionResponseValue = (
  response: unknown,
): FormSubmissionOptionValueWithOverride | null => {
  const optionValue =
    isSerializedOptionValueWithOverride(response) ?
      response.value
    : Number(response);

  if (!Number.isFinite(optionValue)) {
    return null;
  }

  return {
    value: optionValue,
    override:
      (
        isSerializedOptionValueWithOverride(response) &&
        response.override !== null
      ) ?
        String(response.override)
      : null,
  };
};

export type getFormSubmissionUpdateTransactionsParams = {
  formSubmissionId: number;
  formSubmission: FormSubmissionData;
  userId: string;
};

/**
 * Creates the response persistence operations for a form submission.
 * The caller is responsible for executing the returned operations in its own
 * transaction, together with any other domain-specific operations.
 */
export const getFormSubmissionUpdateTransactions = async ({
  formSubmissionId,
  formSubmission: { responses, geometries },
  userId,
}: getFormSubmissionUpdateTransactionsParams): Promise<
  Prisma.PrismaPromise<number>[]
> => {
  const storedFormSubmission = await prisma.formSubmission.findUnique({
    where: { id: formSubmissionId },
    select: { formId: true },
  });

  if (!storedFormSubmission) {
    throw new Error("Submissão de formulário não encontrada");
  }

  const { formId } = storedFormSubmission;
  const responseQuestionIds = Object.keys(responses).map((key) => Number(key));
  const requestedQuestionIds = [
    ...new Set([
      ...responseQuestionIds,
      ...geometries.map((geometry) => geometry.questionId),
    ]),
  ];
  const questions = await prisma.question.findMany({
    where: {
      id: {
        in: requestedQuestionIds,
      },
      formItems: {
        some: { formId },
      },
    },
    select: {
      id: true,
      questionType: true,
      characterType: true,
    },
  });

  if (questions.length !== requestedQuestionIds.length) {
    throw new Error("Uma ou mais questões não pertencem ao formulário!");
  }

  const writtenResponses: {
    questionId: number;
    value: string | number | null;
  }[] = [];
  const optionsResponses: {
    questionId: number;
    value: FormSubmissionOptionValueWithOverride[];
  }[] = [];
  const booleanResponses: { questionId: number; value: boolean }[] = [];

  questions
    .filter((question) => Object.hasOwn(responses, question.id))
    .forEach((question) => {
      if (!Object.hasOwn(responses, question.id)) {
        throw new Error("Resposta não enviada para uma ou mais questões!");
      }
      const response = responses[question.id];
      if (question.questionType === QuestionTypes.WRITTEN) {
        if (Array.isArray(response)) {
          throw new Error("Resposta em array enviada para questão escrita!");
        }
        if (typeof response === "object" && response !== null) {
          throw new Error("Resposta em objeto enviada para questão escrita!");
        }
        if (typeof response === "boolean") {
          throw new Error("Resposta em booleana enviada para questão escrita!");
        }

        let writtenResponse = response;

        //Date validation
        if (question.characterType === QuestionResponseCharacterTypes.DATE) {
          writtenResponse =
            (
              typeof writtenResponse === "string" &&
              dayjs(writtenResponse, "DD/MM/YYYY", true).isValid()
            ) ?
              writtenResponse
            : null;
        } else if (
          question.characterType === QuestionResponseCharacterTypes.TIME
        ) {
          writtenResponse =
            (
              typeof writtenResponse === "string" &&
              dayjs(writtenResponse, "HH:mm", true).isValid()
            ) ?
              writtenResponse
            : null;
        } else if (
          question.characterType === QuestionResponseCharacterTypes.DATETIME
        ) {
          writtenResponse =
            (
              typeof writtenResponse === "string" &&
              dayjs(writtenResponse, "DD/MM/YYYY HH:mm", true).isValid()
            ) ?
              writtenResponse
            : null;
        }

        writtenResponses.push({
          questionId: question.id,
          value: writtenResponse ?? null,
        });
      } else if (question.questionType === QuestionTypes.OPTIONS) {
        if (!Array.isArray(response)) {
          const optionResponseValue = toOptionResponseValue(response);
          optionsResponses.push({
            questionId: question.id,
            value:
              response == null || optionResponseValue === null ?
                []
              : [optionResponseValue],
          });
        } else {
          optionsResponses.push({
            questionId: question.id,
            value: response
              .map(toOptionResponseValue)
              .filter(
                (item): item is FormSubmissionOptionValueWithOverride =>
                  item !== null,
              ),
          });
        }
      } else if (question.questionType === QuestionTypes.BOOLEAN) {
        if (typeof response !== "boolean") {
          throw new Error(
            "Resposta não booleana enviada para questão de verdadeiro ou falso!",
          );
        }
        booleanResponses.push({ questionId: question.id, value: response });
      }
    });

  const transactions: Prisma.PrismaPromise<number>[] = [];
  const writtenResponsesSQLValues = writtenResponses.map(
    (response) =>
      Prisma.sql`(${response.value}, ${userId}, ${response.questionId}, ${formSubmissionId}, NOW())`,
  );
  if (writtenResponsesSQLValues.length > 0) {
    const writtenResponsesQuery = Prisma.sql`INSERT INTO "response" ("response", "user_id", "question_id", "form_submission_id", "updated_at")
      VALUES ${Prisma.join(writtenResponsesSQLValues, `,`)}
      ON CONFLICT ("form_submission_id", "question_id")
      DO UPDATE SET "response" = EXCLUDED."response", "user_id" = EXCLUDED."user_id", "updated_at" = EXCLUDED."updated_at"`;

    transactions.push(prisma.$executeRaw(writtenResponsesQuery));
  }

  const booleanResponsesSQLValues = booleanResponses.map(
    (response) =>
      Prisma.sql`(${response.value ? BooleanResponseValue.TRUE : BooleanResponseValue.FALSE}, ${userId}, ${response.questionId}, ${formSubmissionId}, NOW())`,
  );

  if (booleanResponsesSQLValues.length > 0) {
    const booleanResponsesQuery = Prisma.sql`INSERT INTO "response" ("response", "user_id", "question_id", "form_submission_id", "updated_at")
      VALUES ${Prisma.join(booleanResponsesSQLValues, `,`)}
      ON CONFLICT ("form_submission_id", "question_id")
      DO UPDATE SET "response" = EXCLUDED."response", "user_id" = EXCLUDED."user_id", "updated_at" = EXCLUDED."updated_at"`;
    transactions.push(prisma.$executeRaw(booleanResponsesQuery));
  }

  const existingOptions = await prisma.responseOption.findMany({
    where: { formSubmissionId },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });

  // group responseOption by questionId
  const responseOptionsByQuestion = existingOptions.reduce<
    Record<number, typeof existingOptions>
  >((acc, responseOption) => {
    (acc[responseOption.questionId] ||= []).push(responseOption);
    return acc;
  }, {});

  const responseOptionIds: number[] = [];
  const optionCaseStatements: Prisma.Sql[] = [];
  const overrideCaseStatements: Prisma.Sql[] = [];

  for (const { questionId, value } of optionsResponses) {
    const options = value;

    //Creating CASE conditionals
    //Each responseOption related to the form submission will be modified
    //If there are more responseOption than options selected, the remaing responseOptions will have NULL atributed to optionId
    const responseOptions = responseOptionsByQuestion[questionId] || [];
    for (let index = 0; index < responseOptions.length; index++) {
      const responseOption = responseOptions[index];
      if (!responseOption) continue;
      const id = responseOption.id;
      const newOption =
        index < options.length ? (options[index]?.value ?? null) : null;
      const newOverride =
        index < options.length ? (options[index]?.override ?? null) : null;
      responseOptionIds.push(id);
      optionCaseStatements.push(Prisma.sql`WHEN id = ${id} THEN ${newOption}`);
      overrideCaseStatements.push(
        Prisma.sql`WHEN id = ${id} THEN ${newOverride}`,
      );
    }
  }

  if (responseOptionIds.length > 0 && optionCaseStatements.length > 0) {
    const responseOptionUpdate = Prisma.sql`
      UPDATE response_option
      SET option_id = CASE
        ${Prisma.join(optionCaseStatements, "\n")}
        ELSE option_id
      END,
      override_value = CASE
        ${Prisma.join(overrideCaseStatements, "\n")}
        ELSE override_value
      END,
      updated_at = NOW(),
      user_id = ${userId}
      WHERE id IN (${Prisma.join(responseOptionIds)});
    `;

    transactions.push(prisma.$executeRaw(responseOptionUpdate));
  }

  //For each question, in case more options were sent than the current number of reponseOption, an INSERT will be made
  const insertValues: Prisma.Sql[] = [];
  for (const { questionId, value } of optionsResponses) {
    const options = value;
    const existingResponseOptionCount = (
      responseOptionsByQuestion[questionId] || []
    ).length;

    for (
      let index = existingResponseOptionCount;
      index < options.length;
      index++
    ) {
      const option = options[index];
      if (!option) continue;
      insertValues.push(
        Prisma.sql`(${userId}, ${formSubmissionId}, ${questionId}, ${option.value}, ${option.override}, NOW())`,
      );
    }
  }
  if (insertValues.length > 0) {
    const responseOptionInsert = Prisma.sql`INSERT INTO "response_option" ("user_id", "form_submission_id", "question_id", "option_id", "override_value", "updated_at")
      VALUES ${Prisma.join(insertValues, ",")}`;
    transactions.push(prisma.$executeRaw(responseOptionInsert));
  }

  const geometryValues = geometries.map((geometryByQuestion) => {
    const { questionId, geometries: questionGeometries } = geometryByQuestion;
    const geometryCollectionWkt =
      serializeResponseGeometriesToWkt(questionGeometries);
    const geoText =
      geometryCollectionWkt ?
        Prisma.sql`ST_GeomFromText(${geometryCollectionWkt}, 4326)`
      : Prisma.sql`NULL`;
    return Prisma.sql`(${formSubmissionId}, ${questionId}, ${geoText})`;
  });
  if (geometryValues.length > 0) {
    const geometryQuery = Prisma.sql`
      INSERT INTO question_geometry (form_submission_id, question_id, geometry)
      VALUES ${Prisma.join(geometryValues, ",")}
      ON CONFLICT (form_submission_id, question_id)
      DO UPDATE SET geometry = EXCLUDED.geometry
    `;

    transactions.push(prisma.$executeRaw(geometryQuery));
  }

  return transactions;
};
