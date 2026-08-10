import type { CalculationParams } from "@/app/admin/forms/[formId]/edit/calculations/calculationDialog";
import type {
  CategoryItem,
  QuestionItem,
  SubcategoryItem,
} from "@/app/admin/forms/[formId]/edit/clientV2";
import adminSQLiteDb from "@/lib/capacitor/sqlite/adminSQLiteDb/adminSQLiteDb";
import { sqliteBooleanSchema } from "@/lib/capacitor/sqlite/helpers";
import type {
  FetchFormParams,
  FetchFormsResponse,
  fetchFormStructureParams,
  fetchFormStructureResponse,
} from "@/lib/serverFunctions/queries/form";
import type { APIResponse } from "@/lib/types/backendCalls/APIResponse";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import { Calculation } from "@/lib/utils/calculationUtils";
import {
  OptionTypes,
  QuestionGeometryTypes,
  QuestionResponseCharacterTypes,
  QuestionTypes,
} from "@prisma/client";
import { z } from "zod";

const formsSchema = z.array(
  z.object({
    id: z.coerce.number(),
    name: z.string(),
    finalized: sqliteBooleanSchema,
    archived: sqliteBooleanSchema,
    updatedAt: z.coerce.date(),
    assessmentCount: z.coerce.number(),
  }),
);

const formSchema = z.array(
  z.object({
    id: z.coerce.number(),
    name: z.string(),
    finalized: sqliteBooleanSchema,
  }),
);

const categoryFormItemsSchema = z.array(
  z.object({
    categoryId: z.coerce.number(),
    name: z.string(),
    notes: z.string().nullable(),
    position: z.coerce.number(),
  }),
);

const subcategoryFormItemsSchema = z.array(
  z.object({
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
    categoryId: z.coerce.number(),
    subcategoryId: z.coerce.number().nullable(),
    questionId: z.coerce.number(),
    position: z.coerce.number(),
    name: z.string(),
    iconKey: z.string(),
    isPublic: sqliteBooleanSchema,
    notes: z.string().nullable(),
    questionType: z.nativeEnum(QuestionTypes),
    characterType: z.nativeEnum(QuestionResponseCharacterTypes),
    optionType: z.nativeEnum(OptionTypes).nullable(),
    categoryName: z.string(),
    subcategoryName: z.string().nullable(),
    minValue: z.coerce.number().nullable(),
    maxValue: z.coerce.number().nullable(),
    allowResponseImages: sqliteBooleanSchema,
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
    expression: z.string(),
    targetQuestionId: z.coerce.number(),
    questionName: z.string(),
  }),
);

const fetchAdminSQLiteForms = async (
  params: FetchFormParams,
): Promise<APIResponse<FetchFormsResponse>> => {
  try {
    const formsValues = await adminSQLiteDb.query({
      statement: `
        SELECT
          f.id,
          f.name,
          f.finalized,
          f.archived,
          f.updated_at AS updatedAt,
          COUNT(DISTINCT a.id) AS assessmentCount
        FROM form f
        LEFT JOIN assessment a ON a.form_id = f.id
        WHERE 1 = 1
          ${params.finalizedOnly ? "AND f.finalized = 1" : ""}
          ${params.includeArchived ? "" : "AND f.archived = 0"}
        GROUP BY f.id, f.name, f.finalized, f.archived, f.updated_at
        ORDER BY f.archived ASC, f.updated_at DESC
      `,
    });
    const forms = formsSchema.parse(formsValues.values).map(
      ({ assessmentCount, ...form }) => ({
        ...form,
        _count: {
          assessment: assessmentCount,
        },
      }),
    );

    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        forms,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar formulários!",
      } as APIResponseInfo,
      data: {
        forms: [],
      },
    };
  }
};

const fetchAdminSQLiteFormStructure = async (
  params: fetchFormStructureParams,
): Promise<APIResponse<fetchFormStructureResponse>> => {
  try {
    const [
      formValues,
      categoryFormItemsValues,
      subcategoryFormItemsValues,
      questionFormItemsValues,
      optionsValues,
      calculationsValues,
    ] = await Promise.all([
      adminSQLiteDb.query({
        statement: `
          SELECT id, name, finalized
          FROM form
          WHERE id = ?
          LIMIT 1
        `,
        values: [params.formId],
      }),
      adminSQLiteDb.query({
        statement: `
          SELECT
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
        values: [params.formId],
      }),
      adminSQLiteDb.query({
        statement: `
          SELECT
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
        values: [params.formId],
      }),
      adminSQLiteDb.query({
        statement: `
          SELECT
            fi.category_id AS categoryId,
            fi.subcategory_id AS subcategoryId,
            fi.question_id AS questionId,
            fi.position,
            q.name,
            q.icon_key AS iconKey,
            q.is_public AS isPublic,
            q.notes,
            q.question_type AS questionType,
            q.character_type AS characterType,
            q.option_type AS optionType,
            c.name AS categoryName,
            s.name AS subcategoryName,
            q.min_value AS minValue,
            q.max_value AS maxValue,
            q.allow_response_images AS allowResponseImages,
            q.geometry_types AS geometryTypes
          FROM form_item fi
          INNER JOIN question q ON q.id = fi.question_id
          INNER JOIN category c ON c.id = q.category_id
          LEFT JOIN subcategory s ON s.id = q.subcategory_id
          WHERE fi.form_id = ?
            AND fi.question_id IS NOT NULL
        `,
        values: [params.formId],
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
        values: [params.formId],
      }),
      adminSQLiteDb.query({
        statement: `
          SELECT
            c.expression,
            c.target_question_id AS targetQuestionId,
            q.name AS questionName
          FROM calculation c
          INNER JOIN question q ON q.id = c.target_question_id
          WHERE c.form_id = ?
        `,
        values: [params.formId],
      }),
    ]);

    const form = formSchema.parse(formValues.values)[0];
    if (!form) {
      throw new Error("Form not found");
    }

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
    const optionsByQuestionId = options.reduce((result, option) => {
      const questionOptions = result.get(option.questionId) ?? [];
      questionOptions.push({
        id: option.id,
        text: option.text,
        isOverridable: option.isOverridable,
      });
      result.set(option.questionId, questionOptions);
      return result;
    }, new Map<number, QuestionItem["options"]>());

    const categories: CategoryItem[] = [];
    categoryFormItems.forEach((item) => {
      if (
        !categories.some(
          (category) => category.categoryId === item.categoryId,
        )
      ) {
        categories.push({
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
        const subcategory: SubcategoryItem = {
          position: item.position,
          subcategoryId: item.subcategoryId,
          name: item.name,
          notes: item.notes,
          questions: [],
        };
        category.categoryChildren.push(subcategory);
      }
    });

    questionFormItems.forEach((item) => {
      const category = categories.find(
        (category) => category.categoryId === item.categoryId,
      );
      if (!category) {
        throw new Error("Question's category not found");
      }

      const question: QuestionItem = {
        position: item.position,
        questionId: item.questionId,
        name: item.name,
        iconKey: item.iconKey,
        isPublic: item.isPublic,
        notes: item.notes,
        questionType: item.questionType,
        characterType: item.characterType,
        optionType: item.optionType,
        categoryName: item.categoryName,
        subcategoryName: item.subcategoryName,
        options: optionsByQuestionId.get(item.questionId) ?? [],
        minValue: item.minValue,
        maxValue: item.maxValue,
        allowResponseImages: item.allowResponseImages,
        geometryTypes: item.geometryTypes,
      };

      if (item.subcategoryId === null) {
        category.categoryChildren.push(question);
        return;
      }

      const subcategory = category.categoryChildren.find(
        (child): child is SubcategoryItem =>
          "subcategoryId" in child &&
          child.subcategoryId === item.subcategoryId,
      );
      if (subcategory) {
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

    const calculations: CalculationParams[] = calculationsSchema
      .parse(calculationsValues.values)
      .map((item) => ({
        targetQuestionId: item.targetQuestionId,
        questionName: item.questionName,
        expression: item.expression,
        expressionQuestionsIds: new Calculation(
          item.expression,
        ).getExpressionQuestionIds(),
      }));

    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        form: {
          statusCode: 200,
          formTree: {
            id: form.id,
            name: form.name,
            finalized: form.finalized,
            categories,
          },
        },
        calculations,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar estrutura do formulário!",
      } as APIResponseInfo,
      data: {
        form: {
          statusCode: 500,
          formTree: null,
        },
        calculations: [],
      },
    };
  }
};

export { fetchAdminSQLiteForms, fetchAdminSQLiteFormStructure };
