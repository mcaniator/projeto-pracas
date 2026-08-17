import type {
  ResponseFormGeometry,
  SerializedFormValues,
} from "@/components/ui/responseForm/responseFormTypes";
import adminSQLiteDb from "@/lib/capacitor/sqlite/adminSQLiteDb/adminSQLiteDb";
import { sqliteBooleanSchema } from "@/lib/capacitor/sqlite/helpers";
import type { SQLiteBulkUpsertOperation } from "@/lib/capacitor/sqlite/sqlite";
import dayjs from "@/lib/dayjs";
import { BooleanResponseValue } from "@/lib/enums/assessmentResponse";
import { FINALIZATION_STATUS } from "@/lib/enums/finalizationStatus";
import type {
  CreateAssessmentData,
  CreateAssessmentResponse,
} from "@/lib/serverFunctions/mutations/assessmentUtil";
import type {
  AddResponsesData,
  AddResponsesResponse,
} from "@/lib/serverFunctions/mutations/responseUtil";
import type {
  AssessmentCategoryItem,
  AssessmentQuestionItem,
  AssessmentSubcategoryItem,
  FetchAssessmentTreeParams,
  FetchAssessmentTreeResponse,
  FetchAssessmentUsersResponse,
  FetchAssessmentsParams,
  FetchAssessmentsResponse,
} from "@/lib/serverFunctions/queries/assessment";
import type {
  APIRequest,
  APIRequestData,
  APIRequestParams,
  APIResponse,
} from "@/lib/types/backendCalls/APIResponse";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import type { AssessmentOptionValueWithOverride } from "@/lib/types/overridableOptionsComponents";
import {
  deserializeResponseGeometriesFromWkt,
  serializeResponseGeometriesToWkt,
} from "@/lib/utils/responseGeometry";
import {
  OptionTypes,
  QuestionGeometryTypes,
  QuestionResponseCharacterTypes,
  QuestionTypes,
  Role,
} from "@prisma/client";
import { z } from "zod";

const assessmentsSchema = z.array(
  z.object({
    id: z.coerce.number(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().nullable(),
    isFinalized: sqliteBooleanSchema,
    isPublic: sqliteBooleanSchema,
    username: z.string(),
    formName: z.string(),
    locationName: z.string(),
  }),
);

const assessmentUsersSchema = z.array(
  z.object({
    id: z.string(),
    username: z.string(),
  }),
);

const assessmentSchema = z.array(
  z.object({
    id: z.coerce.number(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().nullable(),
    isFinalized: sqliteBooleanSchema,
    updatedAt: z.coerce.date(),
    driveFolderUrl: z.string().nullable(),
    userId: z.string(),
    username: z.string(),
    locationId: z.coerce.number(),
    locationName: z.string(),
    locationPolygon: z.string().nullable(),
    formId: z.coerce.number(),
    formName: z.string(),
  }),
);

const categoryFormItemsSchema = z.array(
  z.object({
    id: z.coerce.number(),
    categoryId: z.coerce.number(),
    name: z.string(),
    notes: z.string().nullable(),
    position: z.coerce.number(),
  }),
);

const subcategoryFormItemsSchema = z.array(
  z.object({
    id: z.coerce.number(),
    categoryId: z.coerce.number(),
    subcategoryId: z.coerce.number(),
    name: z.string(),
    notes: z.string().nullable(),
    position: z.coerce.number(),
  }),
);

const geometryTypesSchema = z
  .string()
  .transform((value) => JSON.parse(value) as unknown)
  .pipe(z.array(z.nativeEnum(QuestionGeometryTypes)));

const questionFormItemsSchema = z.array(
  z.object({
    id: z.coerce.number(),
    categoryId: z.coerce.number(),
    subcategoryId: z.coerce.number().nullable(),
    questionId: z.coerce.number(),
    position: z.coerce.number(),
    name: z.string(),
    iconKey: z.string(),
    isPublic: sqliteBooleanSchema,
    allowResponseImages: sqliteBooleanSchema,
    minValue: z.coerce.number().nullable(),
    maxValue: z.coerce.number().nullable(),
    notes: z.string().nullable(),
    questionType: z.nativeEnum(QuestionTypes),
    characterType: z.nativeEnum(QuestionResponseCharacterTypes),
    optionType: z.nativeEnum(OptionTypes).nullable(),
    geometryTypes: geometryTypesSchema,
  }),
);

const optionsSchema = z.array(
  z.object({
    id: z.coerce.number(),
    questionId: z.coerce.number(),
    text: z.string(),
    isOverridable: sqliteBooleanSchema,
  }),
);

const calculationsSchema = z.array(
  z.object({
    targetQuestionId: z.coerce.number(),
    expression: z.string(),
  }),
);

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
    geometries: z.string().nullable(),
  }),
);

const currentUserForResponsesSchema = z.object({
  id: z.string(),
  roles: z
    .string()
    .transform((value) => JSON.parse(value) as unknown)
    .pipe(z.array(z.nativeEnum(Role))),
});

const editableAssessmentSchema = z.object({
  id: z.coerce.number(),
  createdLocally: sqliteBooleanSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable(),
  isFinalized: sqliteBooleanSchema,
  isPublic: sqliteBooleanSchema,
  driveFolderUrl: z.string().nullable(),
  userId: z.string(),
  locationId: z.coerce.number(),
  formId: z.coerce.number(),
  createdAt: z.coerce.date(),
});

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
): AssessmentOptionValueWithOverride | null => {
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

const createAdminSQLiteAssessment = async (
  request: APIRequestData<CreateAssessmentData>,
): Promise<APIResponse<CreateAssessmentResponse>> => {
  try {
    const formData = request.data!;
    const locationId = z.coerce.number().parse(formData.get("locationId"));
    const formId = z.coerce.number().parse(formData.get("formId"));
    const startDate = z.coerce.date().parse(formData.get("startDate"));
    const currentUserValues = await adminSQLiteDb.query({
      statement: `SELECT id FROM "current_user" LIMIT 1`,
    });
    const userId = z
      .object({ id: z.string() })
      .parse(currentUserValues.values[0]).id;
    const now = new Date();

    const result = await adminSQLiteDb.run(
      `INSERT INTO assessment (
        created_locally,
        start_date,
        end_date,
        is_finalized,
        is_public,
        drive_folder_url,
        user_id,
        location_id,
        form_id,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [1, startDate, null, 0, 0, null, userId, locationId, formId, now, now],
    );

    return {
      responseInfo: {
        statusCode: 201,
        message: "Avaliação criada no dispositivo!",
      } as APIResponseInfo,
      data: {
        assessmentId: result.changes.lastId,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao criar avaliação offline!",
      } as APIResponseInfo,
      data: null,
    };
  }
};

type CreateAssessmentDataFromRemoteAssessment = {
  id: number;
  startDate: Date;
  endDate: Date | null;
  isFinalized: boolean;
  isPublic: boolean;
  driveFolderUrl: string | null;
  locationId: number;
  formId: number;
};

const createAdminSQLiteAssessmentFromRemoteAssessment = async (
  request: APIRequestData<CreateAssessmentDataFromRemoteAssessment>,
): Promise<APIResponse<CreateAssessmentResponse>> => {
  try {
    const data = request.data;
    if (!data) {
      throw new Error("Data not found");
    }
    const currentUserValues = await adminSQLiteDb.query({
      statement: `SELECT id FROM "current_user" LIMIT 1`,
    });
    const userId = z
      .object({ id: z.string() })
      .parse(currentUserValues.values[0]).id;
    const now = new Date();

    const result = await adminSQLiteDb.run(
      `INSERT INTO assessment (
        created_locally,
        id,
        start_date,
        end_date,
        is_finalized,
        is_public,
        drive_folder_url,
        user_id,
        location_id,
        form_id,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        0,
        data.id,
        data.startDate,
        data.endDate,
        data.isFinalized,
        data.isPublic,
        data.driveFolderUrl,
        userId,
        data.locationId,
        data.formId,
        now,
        now,
      ],
    );

    return {
      responseInfo: {
        statusCode: 201,
        message: "Avaliação criada no dispositivo!",
      } as APIResponseInfo,
      data: {
        assessmentId: result.changes.lastId,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao criar avaliação offline!",
      } as APIResponseInfo,
      data: null,
    };
  }
};

const adminSQLiteAddResponsesV2 = async (
  request: APIRequestData<AddResponsesData>,
): Promise<APIResponse<AddResponsesResponse>> => {
  const {
    assessmentId,
    responses,
    geometries,
    startDate,
    endDate,
    isFinalized,
    driveFolderUrl,
  } = request.data!;

  try {
    const currentUserValues = await adminSQLiteDb.query({
      statement: `SELECT id, roles FROM "current_user" LIMIT 1`,
    });
    const currentUserValue = currentUserValues.values[0];
    if (!currentUserValue) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Erro na autenticação!",
        } as APIResponseInfo,
      };
    }
    const currentUser = currentUserForResponsesSchema.parse(currentUserValue);
    const assessmentValues = await adminSQLiteDb.query({
      statement: `
        SELECT
          id,
          created_locally AS createdLocally,
          start_date AS startDate,
          end_date AS endDate,
          is_finalized AS isFinalized,
          is_public AS isPublic,
          drive_folder_url AS driveFolderUrl,
          user_id AS userId,
          location_id AS locationId,
          form_id AS formId,
          created_at AS createdAt
        FROM assessment
        WHERE id = ?
        LIMIT 1
      `,
      values: [assessmentId],
    });
    const assessmentValue = assessmentValues.values[0];
    if (!assessmentValue) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Avaliação não encontrada!",
        } as APIResponseInfo,
      };
    }
    const assessment = editableAssessmentSchema.parse(assessmentValue);

    if (
      currentUser.id !== assessment.userId &&
      !currentUser.roles.includes(Role.ASSESSMENT_MANAGER)
    ) {
      return {
        responseInfo: {
          statusCode: 401,
          message: "Sem permissão para editar esta avaliação!",
        } as APIResponseInfo,
      };
    }

    // It is too dangerous to use WHERE q.id IN (Object.keys(responses).map((key) => Number(key))) because of the 999 parameter limit on older versions of SQLite.
    // The workaround is to get all the questions from the form and filter them in memory.
    const questionValues = await adminSQLiteDb.query({
      statement: `SELECT DISTINCT
        q.id,
        q.question_type AS questionType,
        q.character_type AS characterType
      FROM question q
      INNER JOIN form_item fi ON fi.question_id = q.id
      INNER JOIN assessment a ON a.form_id = fi.form_id
      WHERE a.id = ?`,
      values: [assessmentId],
    });
    const responseQuestionIds = new Set(
      Object.keys(responses).map((key) => Number(key)),
    );
    const questions = responseQuestionSchema
      .parse(questionValues.values)
      .filter((question) => responseQuestionIds.has(question.id));

    const writtenResponses: {
      questionId: number;
      value: string | number | null;
    }[] = [];
    const optionsResponses: {
      questionId: number;
      value: AssessmentOptionValueWithOverride[];
    }[] = [];
    const booleanResponses: { questionId: number; value: boolean }[] = [];

    questions.forEach((question) => {
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
                (item): item is AssessmentOptionValueWithOverride =>
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
        WHERE assessment_id = ?
        ORDER BY created_at ASC, id ASC
      `,
      values: [assessmentId],
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

    // The assessment is also in the UPSERT because it is only updated if the transaction succeeds.

    const now = new Date();
    const nowISOString = now.toISOString();
    const bulkUpserts: SQLiteBulkUpsertOperation[] = [
      {
        table: "assessment",
        insertColumns: [
          "id",
          "created_locally",
          "start_date",
          "end_date",
          "is_finalized",
          "is_public",
          "drive_folder_url",
          "user_id",
          "location_id",
          "form_id",
          "created_at",
          "updated_at",
        ],
        updateColumns: [
          "start_date",
          "end_date",
          "is_finalized",
          "is_public",
          "drive_folder_url",
          "updated_at",
        ],
        conflictColumns: ["id"],
        rows: [
          [
            assessment.id,
            assessment.createdLocally,
            startDate.toISOString(),
            endDate?.toISOString() ?? null,
            isFinalized,
            isFinalized && assessment.isPublic,
            driveFolderUrl,
            assessment.userId,
            assessment.locationId,
            assessment.formId,
            assessment.createdAt.toISOString(),
            nowISOString,
          ],
        ],
      },
    ];

    const characterResponseRows = [
      ...writtenResponses.map((response) => ({
        questionId: response.questionId,
        value: response.value,
      })),
      ...booleanResponses.map((response) => ({
        questionId: response.questionId,
        value:
          response.value ?
            BooleanResponseValue.TRUE
          : BooleanResponseValue.FALSE,
      })),
    ].map((response) => [
      currentUser.id,
      assessmentId,
      response.questionId,
      response.value,
      nowISOString,
      nowISOString,
    ]);
    if (characterResponseRows.length > 0) {
      bulkUpserts.push({
        table: "response",
        insertColumns: [
          "user_id",
          "assessment_id",
          "question_id",
          "response",
          "created_at",
          "updated_at",
        ],
        updateColumns: ["user_id", "response", "updated_at"],
        conflictColumns: ["assessment_id", "question_id"],
        rows: characterResponseRows,
      });
    }

    const responseOptionRows: unknown[][] = [];
    optionsResponses.forEach(({ questionId, value }) => {
      const existingOptions = responseOptionsByQuestion.get(questionId) ?? [];
      // Update existing response_option
      existingOptions.forEach((existingOption, index) => {
        const selectedOption = value[index];
        responseOptionRows.push([
          existingOption.id,
          currentUser.id,
          assessmentId,
          questionId,
          selectedOption?.value ?? null,
          selectedOption?.override ?? null,
          existingOption.createdAt.toISOString(),
          nowISOString,
        ]);
      });
      // Add new reponse_option
      for (let index = existingOptions.length; index < value.length; index++) {
        const selectedOption = value[index];
        if (!selectedOption) continue;
        responseOptionRows.push([
          null,
          currentUser.id,
          assessmentId,
          questionId,
          selectedOption.value,
          selectedOption.override,
          nowISOString,
          nowISOString,
        ]);
      }
    });
    if (responseOptionRows.length > 0) {
      bulkUpserts.push({
        table: "response_option",
        insertColumns: [
          "id",
          "user_id",
          "assessment_id",
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
      bulkUpserts.push({
        table: "response_geometry",
        insertColumns: ["assessment_id", "question_id", "geometries"],
        updateColumns: ["geometries"],
        conflictColumns: ["assessment_id", "question_id"],
        rows: geometries.map((geometryByQuestion) => [
          assessmentId,
          geometryByQuestion.questionId,
          serializeResponseGeometriesToWkt(geometryByQuestion.geometries),
        ]),
      });
    }

    await adminSQLiteDb.executeBulkUpsertTransaction(bulkUpserts);

    return {
      responseInfo: {
        statusCode: 201,
        message: "Avaliação salva!",
      } as APIResponseInfo,
      data: {
        savedAsFinalized: isFinalized,
        updatedAt: now,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao salvar avaliaÃ§Ã£o!",
      } as APIResponseInfo,
    };
  }
};

const fetchAdminSQLiteHasAssessments = async (_request: APIRequest) => {
  try {
    const hasAssessments = await adminSQLiteDb.query({
      statement: `SELECT 1 FROM assessment LIMIT 1`,
    });
    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        hasAssessments: hasAssessments.values.length > 0,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar avaliações offline!",
      } as APIResponseInfo,
      data: null,
    };
  }
};

const fetchAdminSQLiteAssessments = async (
  request: APIRequestParams<FetchAssessmentsParams>,
): Promise<APIResponse<FetchAssessmentsResponse>> => {
  const params = request.params ?? {};
  try {
    const where: string[] = ["1 = 1"];
    const values: (number | string)[] = [];

    if (params.startDate) {
      where.push("a.start_date >= ?");
      values.push(params.startDate.toISOString());
    }
    if (params.endDate) {
      where.push("a.start_date <= ?");
      values.push(params.endDate.toISOString());
    }
    if (params.finalizationStatus === FINALIZATION_STATUS.FINALIZED) {
      where.push("a.is_finalized = 1");
    } else if (
      params.finalizationStatus === FINALIZATION_STATUS.NOT_FINALIZED
    ) {
      where.push("a.is_finalized = 0");
    }
    if (params.formId != null) {
      where.push("a.form_id = ?");
      values.push(params.formId);
    }
    if (params.userId != null) {
      where.push("a.user_id = ?");
      values.push(params.userId);
    }
    if (params.locationId != null) {
      where.push("l.id = ?");
      values.push(params.locationId);
    }
    if (params.cityId != null) {
      where.push("l.city_id = ?");
      values.push(params.cityId);
    }
    if (params.narrowUnitId != null) {
      where.push("l.narrow_administrative_unit_id = ?");
      values.push(params.narrowUnitId);
    }
    if (params.intermediateUnitId != null) {
      where.push("l.intermediate_administrative_unit_id = ?");
      values.push(params.intermediateUnitId);
    }
    if (params.broadUnitId != null) {
      where.push("l.broad_administrative_unit_id = ?");
      values.push(params.broadUnitId);
    }

    const assessmentValues = await adminSQLiteDb.query({
      statement: `
        SELECT
          a.id,
          a.start_date AS startDate,
          a.end_date AS endDate,
          a.is_finalized AS isFinalized,
          a.is_public AS isPublic,
          u.username,
          f.name AS formName,
          l.name AS locationName
        FROM assessment a
        INNER JOIN "user" u ON u.id = a.user_id
        INNER JOIN form f ON f.id = a.form_id
        INNER JOIN location l ON l.id = a.location_id
        WHERE ${where.join(" AND ")}
        ORDER BY a.start_date DESC
      `,
      values,
    });
    const assessments = assessmentsSchema
      .parse(assessmentValues.values)
      .map((assessment) => ({
        id: assessment.id,
        startDate: assessment.startDate,
        endDate: assessment.endDate,
        isFinalized: assessment.isFinalized,
        isPublic: assessment.isPublic,
        user: {
          username: assessment.username,
        },
        form: {
          name: assessment.formName,
        },
        location: {
          name: assessment.locationName,
        },
      }));

    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        assessments,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar avaliações!",
      } as APIResponseInfo,
      data: {
        assessments: [],
      },
    };
  }
};

const fetchAdminSQLiteAssessmentUsers = async (
  _request: APIRequest,
): Promise<APIResponse<FetchAssessmentUsersResponse>> => {
  try {
    const userValues = await adminSQLiteDb.query({
      statement: `
        SELECT DISTINCT u.id, u.username
        FROM "user" u
        INNER JOIN assessment a ON a.user_id = u.id
        ORDER BY u.username ASC
      `,
    });
    const users = assessmentUsersSchema.parse(userValues.values);

    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        users,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar avaliadores!",
      } as APIResponseInfo,
      data: {
        users: [],
      },
    };
  }
};

const fetchAdminSQLiteAssessmentTree = async (
  request: APIRequestParams<FetchAssessmentTreeParams>,
): Promise<APIResponse<FetchAssessmentTreeResponse>> => {
  const params = request.params!;
  try {
    const assessmentValues = await adminSQLiteDb.query({
      statement: `
        SELECT
          a.id,
          a.start_date AS startDate,
          a.end_date AS endDate,
          a.is_finalized AS isFinalized,
          a.updated_at AS updatedAt,
          a.drive_folder_url AS driveFolderUrl,
          u.id AS userId,
          u.username,
          l.id AS locationId,
          l.name AS locationName,
          l.polygon AS locationPolygon,
          f.id AS formId,
          f.name AS formName
        FROM assessment a
        INNER JOIN "user" u ON u.id = a.user_id
        INNER JOIN location l ON l.id = a.location_id
        INNER JOIN form f ON f.id = a.form_id
        WHERE a.id = ?
        LIMIT 1
      `,
      values: [params.assessmentId],
    });
    const assessment = assessmentSchema.parse(assessmentValues.values)[0];
    if (!assessment) {
      throw new Error("Assessment not found");
    }

    const [
      categoryFormItemsValues,
      subcategoryFormItemsValues,
      questionFormItemsValues,
      optionsValues,
      calculationsValues,
      responsesValues,
      responseOptionsValues,
      responseGeometriesValues,
    ] = await Promise.all([
      adminSQLiteDb.query({
        statement: `
          SELECT
            fi.id,
            fi.category_id AS categoryId,
            c.name,
            c.notes,
            fi.position
          FROM form_item fi
          INNER JOIN category c ON c.id = fi.category_id
          WHERE fi.form_id = ?
            AND fi.subcategory_id IS NULL
            AND fi.question_id IS NULL
        `,
        values: [assessment.formId],
      }),
      adminSQLiteDb.query({
        statement: `
          SELECT
            fi.id,
            fi.category_id AS categoryId,
            fi.subcategory_id AS subcategoryId,
            s.name,
            s.notes,
            fi.position
          FROM form_item fi
          INNER JOIN subcategory s ON s.id = fi.subcategory_id
          WHERE fi.form_id = ?
            AND fi.subcategory_id IS NOT NULL
            AND fi.question_id IS NULL
        `,
        values: [assessment.formId],
      }),
      adminSQLiteDb.query({
        statement: `
          SELECT
            fi.id,
            fi.category_id AS categoryId,
            fi.subcategory_id AS subcategoryId,
            fi.question_id AS questionId,
            fi.position,
            q.name,
            q.icon_key AS iconKey,
            q.is_public AS isPublic,
            q.allow_response_images AS allowResponseImages,
            q.min_value AS minValue,
            q.max_value AS maxValue,
            q.notes,
            q.question_type AS questionType,
            q.character_type AS characterType,
            q.option_type AS optionType,
            q.geometry_types AS geometryTypes
          FROM form_item fi
          INNER JOIN question q ON q.id = fi.question_id
          WHERE fi.form_id = ?
            AND fi.question_id IS NOT NULL
        `,
        values: [assessment.formId],
      }),
      adminSQLiteDb.query({
        statement: `
          SELECT
            o.id,
            o.question_id AS questionId,
            o.text,
            o.is_overridable AS isOverridable
          FROM "option" o
          INNER JOIN form_item fi ON fi.question_id = o.question_id
          WHERE fi.form_id = ?
        `,
        values: [assessment.formId],
      }),
      adminSQLiteDb.query({
        statement: `
          SELECT target_question_id AS targetQuestionId, expression
          FROM calculation
          WHERE form_id = ?
        `,
        values: [assessment.formId],
      }),
      adminSQLiteDb.query({
        statement: `
          SELECT question_id AS questionId, response
          FROM response
          WHERE assessment_id = ?
        `,
        values: [assessment.id],
      }),
      adminSQLiteDb.query({
        statement: `
          SELECT
            question_id AS questionId,
            option_id AS optionId,
            override_value AS overrideValue
          FROM response_option
          WHERE assessment_id = ?
            AND option_id IS NOT NULL
        `,
        values: [assessment.id],
      }),
      adminSQLiteDb.query({
        statement: `
          SELECT
            question_id AS questionId,
            geometries
          FROM response_geometry
          WHERE assessment_id = ?
        `,
        values: [assessment.id],
      }),
    ]);

    const categoryFormItems = categoryFormItemsSchema.parse(
      categoryFormItemsValues.values,
    );
    const subcategoryFormItems = subcategoryFormItemsSchema.parse(
      subcategoryFormItemsValues.values,
    );
    const questionFormItems = questionFormItemsSchema.parse(
      questionFormItemsValues.values,
    );
    const options = optionsSchema.parse(optionsValues.values);
    const calculations = calculationsSchema.parse(calculationsValues.values);
    const responses = responsesSchema.parse(responsesValues.values);
    const responseOptions = responseOptionsSchema.parse(
      responseOptionsValues.values,
    );
    const geometries: ResponseFormGeometry[] = responseGeometriesSchema
      .parse(responseGeometriesValues.values)
      .map((geometryByQuestion) => ({
        questionId: geometryByQuestion.questionId,
        geometries: deserializeResponseGeometriesFromWkt(
          geometryByQuestion.geometries,
        ),
      }));

    const optionsByQuestionId = options.reduce((result, option) => {
      const questionOptions = result.get(option.questionId) ?? [];
      questionOptions.push({
        id: option.id,
        text: option.text,
        isOverridable: option.isOverridable,
      });
      result.set(option.questionId, questionOptions);
      return result;
    }, new Map<number, NonNullable<AssessmentQuestionItem["options"]>>());
    const calculationByQuestionId = new Map(
      calculations.map((calculation) => [
        calculation.targetQuestionId,
        calculation.expression,
      ]),
    );
    const responseByQuestionId = new Map(
      responses.map((response) => [response.questionId, response.response]),
    );
    const responseOptionsByQuestionId = responseOptions.reduce(
      (result, responseOption) => {
        const questionResponseOptions =
          result.get(responseOption.questionId) ?? [];
        questionResponseOptions.push({
          optionId: responseOption.optionId,
          overrideValue: responseOption.overrideValue,
        });
        result.set(responseOption.questionId, questionResponseOptions);
        return result;
      },
      new Map<number, { optionId: number; overrideValue: string | null }[]>(),
    );

    const categories: AssessmentCategoryItem[] = [];
    categoryFormItems.forEach((item) => {
      if (
        !categories.some((category) => category.categoryId === item.categoryId)
      ) {
        categories.push({
          id: item.id,
          categoryId: item.categoryId,
          name: item.name,
          notes: item.notes,
          position: item.position,
          categoryChildren: [],
        });
      }
    });

    subcategoryFormItems.forEach((item) => {
      const category = categories.find(
        (category) => category.categoryId === item.categoryId,
      );
      if (!category) {
        throw new Error("Subcategory's category not found");
      }
      if (
        !category.categoryChildren.some(
          (child) =>
            "subcategoryId" in child &&
            child.subcategoryId === item.subcategoryId,
        )
      ) {
        category.categoryChildren.push({
          id: item.id,
          position: item.position,
          subcategoryId: item.subcategoryId,
          name: item.name,
          notes: item.notes,
          questions: [],
        });
      }
    });

    let totalQuestions = 0;
    const responsesFormValues: SerializedFormValues = {};
    questionFormItems.forEach((item) => {
      totalQuestions++;
      const response = responseByQuestionId.get(item.questionId) ?? null;
      const selectedOptions =
        responseOptionsByQuestionId.get(item.questionId) ?? [];

      if (item.questionType === QuestionTypes.WRITTEN) {
        if (
          item.characterType === QuestionResponseCharacterTypes.NUMBER ||
          item.characterType === QuestionResponseCharacterTypes.PERCENTAGE ||
          item.characterType === QuestionResponseCharacterTypes.SCALE
        ) {
          responsesFormValues[item.questionId] =
            response ? Number(response) : null;
        } else {
          responsesFormValues[item.questionId] = response;
        }
      } else if (item.questionType === QuestionTypes.OPTIONS) {
        if (item.optionType === OptionTypes.RADIO) {
          const selectedOption = selectedOptions[0];
          responsesFormValues[item.questionId] =
            selectedOption ?
              {
                value: selectedOption.optionId,
                override: selectedOption.overrideValue,
              }
            : null;
        } else if (item.optionType === OptionTypes.CHECKBOX) {
          responsesFormValues[item.questionId] = selectedOptions.map(
            (selectedOption) => ({
              value: selectedOption.optionId,
              override: selectedOption.overrideValue,
            }),
          );
        }
      } else if (item.questionType === QuestionTypes.BOOLEAN) {
        responsesFormValues[item.questionId] =
          response === BooleanResponseValue.TRUE;
      }

      const category = categories.find(
        (category) => category.categoryId === item.categoryId,
      );
      if (!category) {
        throw new Error("Question's category not found");
      }
      const question: AssessmentQuestionItem = {
        id: item.id,
        position: item.position,
        questionId: item.questionId,
        name: item.name,
        iconKey: item.iconKey,
        isPublic: item.isPublic,
        allowResponseImages: item.allowResponseImages,
        minValue: item.minValue,
        maxValue: item.maxValue,
        notes: item.notes,
        questionType: item.questionType,
        characterType: item.characterType,
        optionType: item.optionType,
        options: optionsByQuestionId.get(item.questionId) ?? [],
        geometryTypes: item.geometryTypes,
        calculationExpression: calculationByQuestionId.get(item.questionId),
        categoryName: category.name,
        subcategoryName: null,
      };

      if (item.subcategoryId === null) {
        category.categoryChildren.push(question);
        return;
      }
      const subcategory = category.categoryChildren.find(
        (child): child is AssessmentSubcategoryItem =>
          "subcategoryId" in child &&
          child.subcategoryId === item.subcategoryId,
      );
      if (subcategory) {
        question.subcategoryName = subcategory.name;
        subcategory.questions.push(question);
      }
    });

    categories.sort((a, b) => a.position - b.position);
    categories.forEach((category) => {
      category.categoryChildren.sort((a, b) => a.position - b.position);
      category.categoryChildren.forEach((child) => {
        if ("subcategoryId" in child) {
          child.questions.sort((a, b) => a.position - b.position);
        }
      });
    });
    const nonEmptyCategories = categories
      .map((category) => ({
        ...category,
        categoryChildren: category.categoryChildren.filter(
          (child) => !("subcategoryId" in child) || child.questions.length > 0,
        ),
      }))
      .filter((category) => category.categoryChildren.length > 0);

    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        assessmentTree: {
          id: assessment.id,
          startDate: assessment.startDate,
          endDate: assessment.endDate,
          isFinalized: assessment.isFinalized,
          updatedAt: assessment.updatedAt,
          driveFolderUrl: assessment.driveFolderUrl,
          formName: assessment.formName,
          formId: assessment.formId,
          location: {
            id: assessment.locationId,
            name: assessment.locationName,
            st_asgeojson: assessment.locationPolygon,
          },
          user: {
            id: assessment.userId,
            username: assessment.username,
          },
          totalQuestions,
          responsesFormValues,
          geometries,
          categories: nonEmptyCategories,
        },
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao buscar avaliação!",
      } as APIResponseInfo,
      data: null,
    };
  }
};

const FetchAdminSQLiteIfCanSaveAssessmentParamsSchema = z.object({
  formId: z.coerce.number(),
  locationId: z.coerce.number(),
  userId: z.string(),
});

type FetchAdminSQLiteIfCanSaveAssessmentParams = z.infer<
  typeof FetchAdminSQLiteIfCanSaveAssessmentParamsSchema
>;

const fetchAdminSQLiteIfCanSaveAssessment = async (
  request: APIRequestParams<FetchAdminSQLiteIfCanSaveAssessmentParams>,
) => {
  try {
    const params = request.params;
    if (!params) {
      throw new Error("Params not found");
    }
    const formId = params.formId;
    const locationId = params.locationId;
    const userId = params.userId;

    const SQLiteForm = await adminSQLiteDb.query({
      statement: `SELECT * FROM "form" WHERE id = ? LIMIT 1`,
      values: [formId],
    });
    const SQLiteLocation = await adminSQLiteDb.query({
      statement: `SELECT * FROM "location" WHERE id = ? LIMIT 1`,
      values: [locationId],
    });
    const SQLiteUser = await adminSQLiteDb.query({
      statement: `SELECT * FROM "user" WHERE id = ? LIMIT 1`,
      values: [userId],
    });

    let canSave = false;
    if (
      SQLiteForm.values.length > 0 &&
      SQLiteLocation.values.length > 0 &&
      SQLiteUser.values.length > 0
    ) {
      canSave = true;
    }
    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        canSave,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
      } as APIResponseInfo,
      data: {
        canSave: false,
      },
    };
  }
};

export {
  adminSQLiteAddResponsesV2,
  createAdminSQLiteAssessment,
  createAdminSQLiteAssessmentFromRemoteAssessment,
  fetchAdminSQLiteAssessments,
  fetchAdminSQLiteAssessmentTree,
  fetchAdminSQLiteAssessmentUsers,
  fetchAdminSQLiteHasAssessments,
  fetchAdminSQLiteIfCanSaveAssessment,
};
