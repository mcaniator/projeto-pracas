import type { FetchQuestionUsesParams } from "@/app/api/admin/forms/fieldsCreation/question/questionUses/route";
import type { FetchQuestionsByCategoryAndSubcategoryParams } from "@/app/api/admin/forms/fieldsCreation/question/route";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import { prisma } from "@lib/prisma";
import { Prisma } from "@prisma/client";

import { CategoryForQuestionPicker } from "../../types/forms/formCreation";

const buildQuestionsByCategoryQuery = ({
  categoryWhere,
  categoryQuestionWhere,
  subcategoryQuestionWhere,
}: {
  categoryWhere: Prisma.Sql;
  categoryQuestionWhere: Prisma.Sql;
  subcategoryQuestionWhere: Prisma.Sql;
}) => Prisma.sql`
  SELECT
    c.id,
    c.name,
    c.notes,

    COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'id', q.id,
            'name', q.name,
            'iconKey', q."icon_key",
            'isPublic', q."is_public",
            'questionType', q."question_type",
            'notes', q.notes,
            'characterType', q."character_type",
            'optionType', q."option_type",
            'geometryTypes', COALESCE(array_to_json(q."geometry_types"), '[]'::json),
            'scaleConfig',
              (
                SELECT json_build_object(
                  'minValue', qsc."min_value",
                  'maxValue', qsc."max_value"
                )
                FROM "question_scale_config" qsc
                WHERE qsc."question_id" = q.id
              ),
            'options', COALESCE(
              (
                SELECT json_agg(
                  json_build_object(
                    'id', o.id,
                    'text', o.text,
                    'isOverridable', o."is_overridable"
                  ) ORDER BY o.id ASC
                )
                FROM "option" o
                WHERE o."question_id" = q.id
              ),
              '[]'::json
            )
          ) ORDER BY q.name DESC
        )
        FROM "question" q
        WHERE q."category_id" = c.id
          AND q."subcategory_id" IS NULL
          ${categoryQuestionWhere}
      ),
      '[]'::json
    ) AS question,

    COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'id', s.id,
            'name', s.name,
            'notes', s.notes,
            'question', COALESCE(
              (
                SELECT json_agg(
                  json_build_object(
                    'id', sq.id,
                    'name', sq.name,
                    'iconKey', sq."icon_key",
                    'isPublic', sq."is_public",
                    'questionType', sq."question_type",
                    'notes', sq.notes,
                    'characterType', sq."character_type",
                    'optionType', sq."option_type",
                    'geometryTypes', COALESCE(array_to_json(sq."geometry_types"), '[]'::json),
                    'scaleConfig',
                      (
                        SELECT json_build_object(
                          'minValue', sqsc."min_value",
                          'maxValue', sqsc."max_value"
                        )
                        FROM "question_scale_config" sqsc
                        WHERE sqsc."question_id" = sq.id
                      ),
                    'options', COALESCE(
                      (
                        SELECT json_agg(
                          json_build_object(
                            'id', so.id,
                            'text', so.text,
                            'isOverridable', so."is_overridable"
                          ) ORDER BY so.id ASC
                        )
                        FROM "option" so
                        WHERE so."question_id" = sq.id
                      ),
                      '[]'::json
                    )
                  ) ORDER BY sq.name DESC
                )
                FROM "question" sq
                WHERE sq."subcategory_id" = s.id
                  ${subcategoryQuestionWhere}
              ),
              '[]'::json
            )
          ) ORDER BY s.name DESC
        )
        FROM "subcategory" s
        WHERE s."category_id" = c.id
      ),
      '[]'::json
    ) AS subcategory

  FROM "category" c
  WHERE 1 = 1
    ${categoryWhere}
  ORDER BY c.name DESC
`;

export type FetchquestionsByCategoryAndSubcategoryResponse = NonNullable<
  Awaited<ReturnType<typeof searchQuestionsByCategoryAndSubcategory>>["data"]
>;
const searchQuestionsByCategoryAndSubcategory = async (
  params: FetchQuestionsByCategoryAndSubcategoryParams,
) => {
  if (!params.categoryId) return { statusCode: 400, categories: [] };
  try {
    const categoryQuestionFilter =
      (
        (params.verifySubcategoryNullness && !params.subcategoryId) ||
        params.subcategoryId === 0 ||
        params.subcategoryId === -1
      ) ?
        Prisma.empty
      : Prisma.sql`AND q.id = -1`;
    const subcategoryQuestionFilter =
      params.verifySubcategoryNullness && !params.subcategoryId ?
        Prisma.sql`AND sq.id = -1`
      : !params.subcategoryId ? Prisma.empty
      : Prisma.sql`AND sq."subcategory_id" = ${params.subcategoryId}`;

    const categories = await prisma.$queryRaw<Array<CategoryForQuestionPicker>>(
      buildQuestionsByCategoryQuery({
        categoryWhere: Prisma.sql`AND c.id = ${params.categoryId}`,
        categoryQuestionWhere: categoryQuestionFilter,
        subcategoryQuestionWhere: subcategoryQuestionFilter,
      }),
    );

    const nonEmptyCategories = categories.filter(
      (cat) =>
        cat.subcategory.some((sub) => sub.question.length > 0) ||
        cat.question.length > 0,
    );

    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: { categories: nonEmptyCategories },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar questões!",
      } as APIResponseInfo,
      data: {
        categories: [],
      },
    };
  }
};

const searchQuestionsByName = async (name: string) => {
  if (!name)
    return {
      responseInfo: {
        statusCode: 400,
        message: "Nome inválido",
      } as APIResponseInfo,
      data: {
        categories: [],
      },
    };
  name = "%" + name + "%";
  try {
    const categories = await prisma.$queryRaw<Array<CategoryForQuestionPicker>>(
      buildQuestionsByCategoryQuery({
        categoryWhere: Prisma.empty,
        categoryQuestionWhere: Prisma.sql`AND unaccent(q.name) ILIKE unaccent(${name})`,
        subcategoryQuestionWhere: Prisma.sql`AND unaccent(sq.name) ILIKE unaccent(${name})`,
      }),
    );

    const nonEmptyCategories = categories.filter(
      (cat) =>
        cat.subcategory.some((sub) => sub.question.length > 0) ||
        cat.question.length > 0,
    );

    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: {
        categories: nonEmptyCategories,
      },
    };
  } catch (e) {
    return {
      responseInfo: { statusCode: 500 },
      data: {
        categories: [],
      },
    };
  }
};

export type FetchquestionUsesResponse = NonNullable<
  Awaited<ReturnType<typeof fetchQuestionUses>>["data"]
>;

type QuestionUses = {
  numberOfAssessments: number;
  numberOfForms: number;
  forms: {
    id: number;
    name: string;
  }[];
  assessments: {
    assessmentId: number;
    location: {
      name: string;
    };
  }[];
};

export const fetchQuestionUses = async (params: FetchQuestionUsesParams) => {
  try {
    const [questionUses] = await prisma.$queryRaw<QuestionUses[]>`
      WITH question_forms AS (
        SELECT DISTINCT fi."form_id"
        FROM "form_item" fi
        WHERE fi."question_id" = ${params.questionId}
      ),
      forms AS (
        SELECT f.id, f.name
        FROM "form" f
        JOIN question_forms qf ON qf."form_id" = f.id
      ),
      assessments AS (
        SELECT
          a.id AS "assessmentId",
          l.name AS "locationName"
        FROM "assessment" a
        JOIN question_forms qf ON qf."form_id" = a."form_id"
        JOIN "location" l ON l.id = a."location_id"
      )
      SELECT
        (SELECT COUNT(*)::int FROM assessments) AS "numberOfAssessments",
        (SELECT COUNT(*)::int FROM forms) AS "numberOfForms",
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', forms.id,
                'name', forms.name
              ) ORDER BY forms.name ASC
            )
            FROM forms
          ),
          '[]'::json
        ) AS forms,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'assessmentId', assessments."assessmentId",
                'location', json_build_object(
                  'name', assessments."locationName"
                )
              ) ORDER BY assessments."assessmentId" ASC
            )
            FROM assessments
          ),
          '[]'::json
        ) AS assessments
    `;

    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        numberOfAssessments: questionUses?.numberOfAssessments ?? 0,
        numberOfForms: questionUses?.numberOfForms ?? 0,
        forms: questionUses?.forms ?? [],
        assessments: questionUses?.assessments ?? [],
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar usos da questão!",
      } as APIResponseInfo,
      data: {
        numberOfAssessments: 0,
        numberOfForms: 0,
        forms: [],
        assessments: [],
      },
    };
  }
};

export { searchQuestionsByCategoryAndSubcategory, searchQuestionsByName };
