import { getSessionUser } from "@/lib/auth/userUtil";
import dayjs from "@/lib/dayjs";
import { BooleanResponseValue } from "@/lib/enums/formSubmissionResponse";
import { prisma } from "@/lib/prisma";
import {
  type FormSubmissionOptionValueWithOverride,
  responseFormGeometrySchema,
  serializedFormValuesSchema,
} from "@/lib/types/formSubmission/responseFormTypes";
import { serializeResponseGeometryToWkt } from "@/lib/utils/responseGeometry";
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
  prismaClient?: Prisma.TransactionClient;
  responseGeometryIdsByLocalId?: ReadonlyMap<string, number>;
};

/**
 * Creates the response persistence operations for a form submission.
 * The caller is responsible for executing the returned operations in its own
 * transaction, together with any other domain-specific operations.
 *
 * Omit `prismaClient` when the returned operations will be passed directly to a batch
 * `prisma.$transaction([...])`. When calling this helper from inside an
 * interactive `prisma.$transaction(async (prismaClient) => ...)`, pass that `prismaClient` so all
 * reads and returned operations use the same connection and participate in
 * the same rollback.
 */
export const getFormSubmissionUpdateTransactions = async ({
  formSubmissionId,
  formSubmission: { responses, geometries },
  prismaClient = prisma,
  responseGeometryIdsByLocalId,
}: getFormSubmissionUpdateTransactionsParams): Promise<
  Prisma.PrismaPromise<number | Prisma.BatchPayload>[]
> => {
  const userId = (await getSessionUser())?.id;

  if (!userId) {
    throw new Error("Usuário não autenticado");
  }

  const storedFormSubmission = await prismaClient.formSubmission.findUnique({
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
  const questions = await prismaClient.question.findMany({
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
      if (
        question.questionType === QuestionTypes.WRITTEN ||
        question.questionType === QuestionTypes.COUNTER
      ) {
        if (Array.isArray(response)) {
          throw new Error("Resposta em array enviada para questão escrita!");
        }
        if (typeof response === "object" && response !== null) {
          throw new Error("Resposta em objeto enviada para questão escrita!");
        }
        if (typeof response === "boolean") {
          throw new Error("Resposta em booleana enviada para questão escrita!");
        }

        let writtenResponse =
          question.questionType === QuestionTypes.COUNTER && response === null ?
            0
          : response;

        if (
          question.questionType === QuestionTypes.COUNTER &&
          (typeof writtenResponse !== "number" ||
            !Number.isInteger(writtenResponse) ||
            writtenResponse < 0)
        ) {
          throw new Error("Resposta inválida enviada para questão contador!");
        }

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

  const transactions: Prisma.PrismaPromise<number | Prisma.BatchPayload>[] = [
    // Serialize replacements of the same submission, even when it has no responses.
    prismaClient.$executeRaw`
      SELECT id FROM form_submission
      WHERE id = ${formSubmissionId}
      FOR NO KEY UPDATE
    `,
    prismaClient.response.deleteMany({ where: { formSubmissionId } }),
    prismaClient.responseOption.deleteMany({ where: { formSubmissionId } }),
    prismaClient.$executeRaw`
      DELETE FROM response_geometry WHERE form_submission_id = ${formSubmissionId}
    `,
  ];

  const responseRows = [
    ...writtenResponses.map(({ questionId, value }) => ({
      questionId,
      response: value === null ? null : String(value),
    })),
    ...booleanResponses.map(({ questionId, value }) => ({
      questionId,
      response: value ? BooleanResponseValue.TRUE : BooleanResponseValue.FALSE,
    })),
  ].map((row) => ({ ...row, formSubmissionId, userId }));
  if (responseRows.length > 0) {
    transactions.push(prismaClient.response.createMany({ data: responseRows }));
  }

  const responseOptionRows = optionsResponses.flatMap(({ questionId, value }) =>
    value.map(({ value: optionId, override: overrideValue }) => ({
      formSubmissionId,
      questionId,
      userId,
      optionId,
      overrideValue,
    })),
  );
  if (responseOptionRows.length > 0) {
    transactions.push(
      prismaClient.responseOption.createMany({ data: responseOptionRows }),
    );
  }

  const geometryRows = geometries.flatMap(
    ({ questionId, geometries: questionGeometries }) =>
      questionGeometries.map((geometry) => {
        const wkt = serializeResponseGeometryToWkt(geometry);
        const description = geometry.description?.trim() || null;
        const id =
          geometry.localId &&
          responseGeometryIdsByLocalId?.get(geometry.localId);
        const idValue = id ? Prisma.sql`${id}` : Prisma.sql`DEFAULT`;
        return Prisma.sql`(${idValue}, ${formSubmissionId}, ${questionId}, ST_GeomFromText(${wkt}, 4326), ${description}, NOW())`;
      }),
  );
  if (geometryRows.length > 0) {
    transactions.push(
      prismaClient.$executeRaw`
        INSERT INTO response_geometry
          (id, form_submission_id, question_id, geometry, description, updated_at)
        VALUES ${Prisma.join(geometryRows)}
      `,
    );
  }

  return transactions;
};
