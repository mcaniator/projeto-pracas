import adminSQLiteDb from "@/lib/capacitor/sqlite/adminSQLiteDb/adminSQLiteDb";
import type {
  SQLiteBulkUpsertOperation,
  SQLiteTransactionOperation,
} from "@/lib/capacitor/sqlite/sqlite";
import dayjs from "@/lib/dayjs";
import { BooleanResponseValue } from "@/lib/enums/formSubmissionResponse";
import type { FormSubmissionData } from "@/lib/serverFunctions/mutations/formSubmission";
import type {
  FormSubmissionCategoryItem,
  FormSubmissionQuestionItem,
} from "@/lib/serverFunctions/queries/formSubmission";
import type {
  FormSubmissionOptionValueWithOverride,
  ResponseFormGeometry,
  SerializedFormValues,
} from "@/lib/types/formSubmission/responseFormTypes";
import type { QuestionItem } from "@/lib/types/forms/formStructure";
import { FormItemUtils } from "@/lib/utils/formTreeUtils";
import {
  deserializeResponseGeometriesFromWkt,
  serializeResponseGeometriesToWkt,
} from "@/lib/utils/responseGeometry";
import {
  OptionTypes,
  QuestionResponseCharacterTypes,
  QuestionTypes,
} from "@prisma/client";
import { z } from "zod";

import { getAdminSQLiteFormStructure } from "./form";

const formSubmissionSchema = z.object({
  formId: z.coerce.number(),
});

const responsesSchema = z.array(
  z.object({
    questionId: z.coerce.number(),
    response: z.string().nullable(),
  }),
);

const responseOptionsSchema = z.array(
  z.object({
    questionId: z.coerce.number(),
    optionId: z.coerce.number(),
    overrideValue: z.string().nullable(),
  }),
);

const responseGeometriesSchema = z.array(
  z.object({
    questionId: z.coerce.number(),
    geometry: z.string().nullable(),
  }),
);

const responseQuestionSchema = z.array(
  z.object({
    id: z.coerce.number(),
    questionType: z.nativeEnum(QuestionTypes),
    characterType: z.nativeEnum(QuestionResponseCharacterTypes),
  }),
);

const existingResponseOptionsSchema = z.array(
  z.object({
    id: z.coerce.number(),
    questionId: z.coerce.number(),
    createdAt: z.coerce.date(),
  }),
);

const isSerializedOptionValueWithOverride = (
  response: unknown,
): response is {
  value: number;
  override: string | number | boolean | null;
} =>
  typeof response === "object" &&
  response !== null &&
  "value" in response &&
  typeof response.value === "number" &&
  "override" in response;

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

const getAdminSQLiteFormSubmissionCreateOperation = ({
  formId,
}: {
  formId: number;
}): SQLiteTransactionOperation => ({
  statement: `INSERT INTO form_submission (form_id) VALUES (?)`,
  values: [formId],
});

const getAdminSQLiteFormSubmissionResponseGeometries = async ({
  formSubmissionId,
  publicQuestionsOnly = false,
}: {
  formSubmissionId: number;
  publicQuestionsOnly?: boolean;
}) => {
  const responseGeometriesValues = await adminSQLiteDb.query({
    statement: `
      SELECT
        question_id AS questionId,
        geometry
      FROM response_geometry rg
      INNER JOIN question q ON q.id = rg.question_id
      WHERE rg.form_submission_id = ?
        ${publicQuestionsOnly ? "AND q.is_public = 1" : ""}
    `,
    values: [formSubmissionId],
  });

  return responseGeometriesSchema.parse(responseGeometriesValues.values).map(
    (responseGeometry): ResponseFormGeometry => ({
      questionId: responseGeometry.questionId,
      geometries: deserializeResponseGeometriesFromWkt(
        responseGeometry.geometry,
      ),
    }),
  );
};

type GetAdminSQLiteFormSubmissionDataParams = {
  formSubmissionId: number;
  includeCalculations: boolean;
  publicQuestionsOnly?: boolean;
};

const getAdminSQLiteFormSubmissionData = async ({
  formSubmissionId,
  includeCalculations,
  publicQuestionsOnly = false,
}: GetAdminSQLiteFormSubmissionDataParams) => {
  const formSubmissionValues = await adminSQLiteDb.query({
    statement: `
      SELECT form_id AS formId
      FROM form_submission
      WHERE id = ?
      LIMIT 1
    `,
    values: [formSubmissionId],
  });
  const formSubmission = formSubmissionSchema.safeParse(
    formSubmissionValues.values[0],
  );
  if (!formSubmission.success) {
    throw new Error("Submissão de formulário não encontrada");
  }

  const { formId } = formSubmission.data;
  const [formStructure, responsesValues, responseOptionsValues, geometries] =
    await Promise.all([
      getAdminSQLiteFormStructure({
        formId,
        publicQuestionsOnly,
        includeCalculations,
      }),
      adminSQLiteDb.query({
        statement: `
          SELECT r.question_id AS questionId, r.response
          FROM response r
          INNER JOIN question q ON q.id = r.question_id
          WHERE r.form_submission_id = ?
            ${publicQuestionsOnly ? "AND q.is_public = 1" : ""}
        `,
        values: [formSubmissionId],
      }),
      adminSQLiteDb.query({
        statement: `
          SELECT
            ro.question_id AS questionId,
            ro.option_id AS optionId,
            ro.override_value AS overrideValue
          FROM response_option ro
          INNER JOIN question q ON q.id = ro.question_id
          WHERE ro.form_submission_id = ?
            AND ro.option_id IS NOT NULL
            ${publicQuestionsOnly ? "AND q.is_public = 1" : ""}
          ORDER BY ro.created_at ASC, ro.id ASC
        `,
        values: [formSubmissionId],
      }),
      getAdminSQLiteFormSubmissionResponseGeometries({
        formSubmissionId,
        publicQuestionsOnly,
      }),
    ]);

  const responses = responsesSchema.parse(responsesValues.values);
  const responseOptions = responseOptionsSchema.parse(
    responseOptionsValues.values,
  );
  const responseByQuestionId = new Map(
    responses.map((response) => [response.questionId, response.response]),
  );
  const responseOptionsByQuestionId = responseOptions.reduce<
    Map<number, typeof responseOptions>
  >((result, responseOption) => {
    const questionResponses = result.get(responseOption.questionId) ?? [];
    questionResponses.push(responseOption);
    result.set(responseOption.questionId, questionResponses);
    return result;
  }, new Map());
  const responsesFormValues: SerializedFormValues = {};

  const toQuestionItem = (
    question: QuestionItem,
  ): FormSubmissionQuestionItem => {
    const response = responseByQuestionId.get(question.questionId);
    const optionResponses =
      responseOptionsByQuestionId.get(question.questionId) ?? [];

    if (question.questionType === QuestionTypes.WRITTEN) {
      if (
        question.characterType === QuestionResponseCharacterTypes.NUMBER ||
        question.characterType === QuestionResponseCharacterTypes.PERCENTAGE ||
        question.characterType === QuestionResponseCharacterTypes.SCALE
      ) {
        responsesFormValues[question.questionId] =
          response ? Number(response) : null;
      } else {
        responsesFormValues[question.questionId] = response ?? null;
      }
    } else if (question.questionType === QuestionTypes.OPTIONS) {
      if (question.optionType === OptionTypes.RADIO) {
        const optionResponse = optionResponses[0];
        responsesFormValues[question.questionId] =
          optionResponse ?
            {
              value: optionResponse.optionId,
              override: optionResponse.overrideValue,
            }
          : null;
      } else if (question.optionType === OptionTypes.CHECKBOX) {
        responsesFormValues[question.questionId] = optionResponses.map(
          (optionResponse) => ({
            value: optionResponse.optionId,
            override: optionResponse.overrideValue,
          }),
        );
      }
    } else if (question.questionType === QuestionTypes.BOOLEAN) {
      responsesFormValues[question.questionId] =
        response === BooleanResponseValue.TRUE;
    }

    return {
      ...question,
      id: question.questionId,
      options: question.options?.map((option) => ({
        id: option.id,
        text: option.text,
        isOverridable: option.isOverridable ?? false,
      })),
    };
  };

  const categories = formStructure.categories
    .map(
      (category): FormSubmissionCategoryItem => ({
        ...category,
        id: category.categoryId,
        categoryChildren: category.categoryChildren.reduce<
          FormSubmissionCategoryItem["categoryChildren"]
        >((children, child) => {
          if (FormItemUtils.isSubcategoryType(child)) {
            const questions = child.questions.map(toQuestionItem);
            if (questions.length > 0) {
              children.push({
                ...child,
                id: child.subcategoryId,
                questions,
              });
            }
            return children;
          }

          children.push(toQuestionItem(child));
          return children;
        }, []),
      }),
    )
    .filter((category) => category.categoryChildren.length > 0);

  return {
    formStructure: {
      formId: formStructure.formId,
      formName: formStructure.formName,
      categories,
      ...(includeCalculations ?
        { calculations: formStructure.calculations ?? [] }
      : {}),
    },
    responsesFormValues,
    geometries,
  };
};

type GetAdminSQLiteFormSubmissionUpdateOperationsParams = {
  formSubmissionId: number;
  formSubmission: FormSubmissionData;
  userId: string;
  updatedAt: Date;
};

const getAdminSQLiteFormSubmissionUpdateOperations = async ({
  formSubmissionId,
  formSubmission: { responses, geometries },
  userId,
  updatedAt,
}: GetAdminSQLiteFormSubmissionUpdateOperationsParams): Promise<
  SQLiteBulkUpsertOperation[]
> => {
  const formSubmissionValues = await adminSQLiteDb.query({
    statement: `
      SELECT form_id AS formId
      FROM form_submission
      WHERE id = ?
      LIMIT 1
    `,
    values: [formSubmissionId],
  });
  const storedFormSubmission = formSubmissionSchema.safeParse(
    formSubmissionValues.values[0],
  );
  if (!storedFormSubmission.success) {
    throw new Error("Submissão de formulário não encontrada");
  }

  const responseQuestionIds = Object.keys(responses).map((key) => Number(key));
  const requestedQuestionIds = new Set([
    ...responseQuestionIds,
    ...geometries.map((geometry) => geometry.questionId),
  ]);

  // Query all form questions to avoid SQLite's legacy 999-parameter limit.
  const questionValues = await adminSQLiteDb.query({
    statement: `
      SELECT DISTINCT
        q.id,
        q.question_type AS questionType,
        q.character_type AS characterType
      FROM question q
      INNER JOIN form_item fi ON fi.question_id = q.id
      WHERE fi.form_id = ?
    `,
    values: [storedFormSubmission.data.formId],
  });
  const questions = responseQuestionSchema
    .parse(questionValues.values)
    .filter((question) => requestedQuestionIds.has(question.id));

  if (questions.length !== requestedQuestionIds.size) {
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

  const existingResponseOptionValues = await adminSQLiteDb.query({
    statement: `
      SELECT
        id,
        question_id AS questionId,
        created_at AS createdAt
      FROM response_option
      WHERE form_submission_id = ?
      ORDER BY created_at ASC, id ASC
    `,
    values: [formSubmissionId],
  });
  const existingResponseOptions = existingResponseOptionsSchema.parse(
    existingResponseOptionValues.values,
  );
  const responseOptionsByQuestion = existingResponseOptions.reduce(
    (result, responseOption) => {
      const questionResponseOptions =
        result.get(responseOption.questionId) ?? [];
      questionResponseOptions.push(responseOption);
      result.set(responseOption.questionId, questionResponseOptions);
      return result;
    },
    new Map<number, typeof existingResponseOptions>(),
  );

  const updatedAtISOString = updatedAt.toISOString();
  const operations: SQLiteBulkUpsertOperation[] = [];
  const characterResponseRows = [
    ...writtenResponses.map((response) => ({
      questionId: response.questionId,
      value: response.value,
    })),
    ...booleanResponses.map((response) => ({
      questionId: response.questionId,
      value:
        response.value ? BooleanResponseValue.TRUE : BooleanResponseValue.FALSE,
    })),
  ].map((response) => [
    userId,
    formSubmissionId,
    response.questionId,
    response.value,
    updatedAtISOString,
    updatedAtISOString,
  ]);
  if (characterResponseRows.length > 0) {
    operations.push({
      table: "response",
      insertColumns: [
        "user_id",
        "form_submission_id",
        "question_id",
        "response",
        "created_at",
        "updated_at",
      ],
      updateColumns: ["user_id", "response", "updated_at"],
      conflictColumns: ["form_submission_id", "question_id"],
      rows: characterResponseRows,
    });
  }

  const responseOptionRows: unknown[][] = [];
  optionsResponses.forEach(({ questionId, value }) => {
    const existingOptions = responseOptionsByQuestion.get(questionId) ?? [];
    // Update every existing response option. Extra rows are kept with null values.
    existingOptions.forEach((existingOption, index) => {
      const selectedOption = value[index];
      responseOptionRows.push([
        existingOption.id,
        userId,
        formSubmissionId,
        questionId,
        selectedOption?.value ?? null,
        selectedOption?.override ?? null,
        existingOption.createdAt.toISOString(),
        updatedAtISOString,
      ]);
    });
    // Insert response options that do not have a corresponding stored row.
    for (let index = existingOptions.length; index < value.length; index++) {
      const selectedOption = value[index];
      if (!selectedOption) continue;
      responseOptionRows.push([
        null,
        userId,
        formSubmissionId,
        questionId,
        selectedOption.value,
        selectedOption.override,
        updatedAtISOString,
        updatedAtISOString,
      ]);
    }
  });
  if (responseOptionRows.length > 0) {
    operations.push({
      table: "response_option",
      insertColumns: [
        "id",
        "user_id",
        "form_submission_id",
        "question_id",
        "option_id",
        "override_value",
        "created_at",
        "updated_at",
      ],
      updateColumns: ["user_id", "option_id", "override_value", "updated_at"],
      conflictColumns: ["id"],
      rows: responseOptionRows,
    });
  }

  if (geometries.length > 0) {
    operations.push({
      table: "response_geometry",
      insertColumns: [
        "form_submission_id",
        "question_id",
        "geometry",
        "created_at",
        "updated_at",
      ],
      updateColumns: ["geometry", "updated_at"],
      conflictColumns: ["form_submission_id", "question_id"],
      rows: geometries.map((responseGeometry) => [
        formSubmissionId,
        responseGeometry.questionId,
        serializeResponseGeometriesToWkt(responseGeometry.geometries),
        updatedAtISOString,
        updatedAtISOString,
      ]),
    });
  }

  return operations;
};

export {
  getAdminSQLiteFormSubmissionCreateOperation,
  getAdminSQLiteFormSubmissionData,
  getAdminSQLiteFormSubmissionUpdateOperations,
};
