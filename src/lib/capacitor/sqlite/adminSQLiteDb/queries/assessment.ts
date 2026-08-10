import type { SerializedFormValues } from "@/components/ui/responseForm/responseFormTypes";
import adminSQLiteDb from "@/lib/capacitor/sqlite/adminSQLiteDb/adminSQLiteDb";
import { sqliteBooleanSchema } from "@/lib/capacitor/sqlite/helpers";
import { BooleanResponseValue } from "@/lib/enums/assessmentResponse";
import { FINALIZATION_STATUS } from "@/lib/enums/finalizationStatus";
import type {
  AssessmentCategoryItem,
  AssessmentQuestionItem,
  AssessmentSubcategoryItem,
  FetchAssessmentUsersResponse,
  FetchAssessmentsParams,
  FetchAssessmentsResponse,
  FetchAssessmentTreeParams,
  FetchAssessmentTreeResponse,
} from "@/lib/serverFunctions/queries/assessment";
import type { APIResponse } from "@/lib/types/backendCalls/APIResponse";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import {
  OptionTypes,
  QuestionGeometryTypes,
  QuestionResponseCharacterTypes,
  QuestionTypes,
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

const fetchAdminSQLiteAssessments = async (
  params: FetchAssessmentsParams,
): Promise<APIResponse<FetchAssessmentsResponse>> => {
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

const fetchAdminSQLiteAssessmentUsers = async (): Promise<
  APIResponse<FetchAssessmentUsersResponse>
> => {
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
  params: FetchAssessmentTreeParams,
): Promise<APIResponse<FetchAssessmentTreeResponse>> => {
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
      new Map<
        number,
        { optionId: number; overrideValue: string | null }[]
      >(),
    );

    const categories: AssessmentCategoryItem[] = [];
    categoryFormItems.forEach((item) => {
      if (
        !categories.some(
          (category) => category.categoryId === item.categoryId,
        )
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
          (child) =>
            !("subcategoryId" in child) || child.questions.length > 0,
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
          geometries: [],
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

export {
  fetchAdminSQLiteAssessments,
  fetchAdminSQLiteAssessmentTree,
  fetchAdminSQLiteAssessmentUsers,
};
