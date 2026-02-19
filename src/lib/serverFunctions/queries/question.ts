import { prisma } from "@lib/prisma";

import { CategoryForQuestionPicker } from "../../types/forms/formCreation";

const searchQuestionsByCategoryAndSubcategory = async (
  categoryId: number | undefined,
  subcategoryId: number | undefined,
  verifySubcategoryNullness: boolean,
): Promise<{ statusCode: number; categories: CategoryForQuestionPicker[] }> => {
  if (!categoryId) return { statusCode: 400, categories: [] };
  try {
    const categories = await prisma.category.findMany({
      where: {
        id: categoryId,
      },
      orderBy: { name: "desc" },
      select: {
        id: true,
        name: true,
        notes: true,
        question: {
          where: {
            subcategoryId: null,
            ...(verifySubcategoryNullness && !subcategoryId ? {}
            : !subcategoryId ? {}
            : { id: -1 }),
          },
          select: {
            id: true,
            name: true,
            questionType: true,
            notes: true,
            characterType: true,
            optionType: true,
            options: true,
            geometryTypes: true,
          },
          orderBy: { name: "desc" },
        },
        subcategory: {
          orderBy: { name: "desc" },
          select: {
            id: true,
            name: true,
            notes: true,
            question: {
              where:
                verifySubcategoryNullness && !subcategoryId ? { id: -1 }
                : !subcategoryId ? {}
                : { subcategoryId },
              select: {
                id: true,
                name: true,
                questionType: true,
                notes: true,
                characterType: true,
                optionType: true,
                options: true,
                geometryTypes: true,
              },
              orderBy: { name: "desc" },
            },
          },
        },
      },
    });

    const nonEmptyCategories = categories.filter(
      (cat) =>
        cat.subcategory.some((sub) => sub.question.length > 0) ||
        cat.question.length > 0,
    );

    return { statusCode: 200, categories: nonEmptyCategories };
  } catch (e) {
    return { statusCode: 500, categories: [] };
  }
};

const searchQuestionsByName = async (
  name: string,
): Promise<{ statusCode: number; categories: CategoryForQuestionPicker[] }> => {
  if (!name) return { statusCode: 400, categories: [] };
  name = "%" + name + "%";
  try {
    // This query was replaced by the one after it to use unaccent
    /*const categoriesLegacyQuery = await prisma.category.findMany({
      orderBy: { name: "desc" },
      select: {
        id: true,
        name: true,
        notes: true,
        question: {
          where: {
            name: {
              contains: name,
              mode: "insensitive",
            },
            subcategoryId: null,
          },
          select: {
            id: true,
            name: true,
            questionType: true,
            notes: true,
            characterType: true,
            optionType: true,
            options: true,
            geometryTypes: true,
          },
          orderBy: { name: "desc" },
        },
        subcategory: {
          orderBy: { name: "desc" },
          select: {
            id: true,
            name: true,
            notes: true,
            question: {
              where: {
                name: {
                  contains: name,
                  mode: "insensitive",
                },
              },
              select: {
                id: true,
                name: true,
                questionType: true,
                notes: true,
                characterType: true,
                optionType: true,
                options: true,
                geometryTypes: true,
              },
              orderBy: { name: "desc" },
            },
          },
        },
      },
    });*/

    const categories = await prisma.$queryRaw<Array<CategoryForQuestionPicker>>`
      SELECT 
        c.id, 
        c.name, 
        c.notes,
        
        -- 1. QUESTÕES DIRETAS DA CATEGORIA
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', q.id,
                'name', q.name,
                'questionType', q."question_type",
                'notes', q.notes,
                'characterType', q."character_type",
                'optionType', q."option_type",
                'geometryTypes', COALESCE(array_to_json(q."geometry_types"), '[]'::json),
                
                -- 1.1. Subquery para buscar as Options relacionadas
                'options', COALESCE(
                  (
                    SELECT json_agg(
                      json_build_object(
                        'id', o.id,
                        'text', o.text
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
              AND unaccent(q.name) ILIKE unaccent(${name})
          ), 
          '[]'::json
        ) AS question,

        -- 2. SUBCATEGORIAS
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
                        'questionType', sq."question_type",
                        'notes', sq.notes,
                        'characterType', sq."character_type",
                        'optionType', sq."option_type",
                        'geometryTypes', COALESCE(array_to_json(sq."geometry_types"), '[]'::json),
                        
                        -- 2.1 Subquery para buscar as Options dentro da Subcategoria
                        'options', COALESCE(
                          (
                            SELECT json_agg(
                              json_build_object(
                                'id', so.id,
                                'text', so.text
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
                      AND unaccent(sq.name) ILIKE unaccent(${name})
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
      ORDER BY c.name DESC
    `;

    const nonEmptyCategories = categories.filter(
      (cat) =>
        cat.subcategory.some((sub) => sub.question.length > 0) ||
        cat.question.length > 0,
    );

    return { statusCode: 200, categories: nonEmptyCategories };
  } catch (e) {
    return { statusCode: 500, categories: [] };
  }
};

export { searchQuestionsByCategoryAndSubcategory, searchQuestionsByName };
