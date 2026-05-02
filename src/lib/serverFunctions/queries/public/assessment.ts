import type { FormValues } from "@/components/ui/responseForm/responseFormTypes";
import { PublicFetchPublicAssessmentsParams } from "@/app/api/public/publicAssessments/route";
import { prisma } from "@/lib/prisma";
import {
  AssessmentCategoryItem,
  AssessmentQuestionItem,
  AssessmentSubcategoryItem,
} from "@/lib/serverFunctions/queries/assessment";
import { fetchAssessmentGeometries } from "@/lib/serverFunctions/serverOnly/geometries";
import { ResponseGeometry } from "@/lib/types/assessments/geometry";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import { FormItemUtils } from "@/lib/utils/formTreeUtils";
import { Coordinate } from "ol/coordinate";

export type PublicFetchPublicAssessmentsResponse = NonNullable<
  Awaited<ReturnType<typeof publicFetchPublicAssessments>>["data"]
>;

export const publicFetchPublicAssessments = async (
  params: PublicFetchPublicAssessmentsParams,
) => {
  try {
    const assessments = await prisma.assessment.findMany({
      where: {
        isPublic: true,
        location: {
          id: params.locationId,
        },
      },
      orderBy: {
        startDate: "desc",
      },
      select: {
        id: true,
        startDate: true,
      },
    });
    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
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

export type PublicFetchPublicAssessmentTreeResponse = NonNullable<
  Awaited<ReturnType<typeof publicFetchPublicAssessmentTree>>["data"]
>;

export const publicFetchPublicAssessmentTree = async (params: {
  assessmentId: number;
}) => {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: params.assessmentId, isPublic: true },
      select: {
        id: true,
        endDate: true,
        startDate: true,
        user: {
          select: {
            username: true,
            id: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        form: {
          select: {
            id: true,
            name: true,
            calculations: {
              select: {
                expression: true,
                targetQuestionId: true,
              },
            },
            formItems: {
              orderBy: { position: "asc" },
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                    notes: true,
                  },
                },
                subcategory: {
                  select: {
                    id: true,
                    name: true,
                    notes: true,
                    categoryId: true,
                  },
                },
                question: {
                  where: {
                    isPublic: true,
                  },
                  select: {
                    id: true,
                    name: true,
                    iconKey: true,
                    isPublic: true,
                    scaleConfig: true,
                    notes: true,
                    questionType: true,
                    characterType: true,
                    optionType: true,
                    options: { select: { text: true, id: true } },
                    categoryId: true,
                    subcategoryId: true,
                    geometryTypes: true,
                    response: {
                      where: {
                        assessmentId: params.assessmentId,
                      },
                      select: {
                        response: true,
                      },
                    },
                    booleanResponses: {
                      where: {
                        assessmentId: params.assessmentId,
                      },
                      select: {
                        checked: true,
                      },
                    },
                    ResponseOption: {
                      where: {
                        assessmentId: params.assessmentId,
                        optionId: { not: null },
                      },
                      select: {
                        id: true,
                        option: {
                          select: {
                            id: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!assessment) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Avaliação não encontrada!",
        } as APIResponseInfo,
        data: null,
      };
    }
    const form = assessment.form;

    const categories: AssessmentCategoryItem[] = [];

    const sortedFormItems = form.formItems.sort((a, b) => {
      const rankDiff =
        FormItemUtils.getItemRankForSorting(a) -
        FormItemUtils.getItemRankForSorting(b);
      if (rankDiff !== 0) return rankDiff;

      return a.position - b.position;
    });

    let totalQuestions = 0;
    const responsesFormValues: FormValues = {};

    for (const item of sortedFormItems) {
      // CATEGORY
      if (FormItemUtils.isCategoryType(item)) {
        if (!categories.find((c) => c.categoryId === item.categoryId)) {
          categories.push({
            id: item.id,
            categoryId: item.categoryId,
            name: item.category.name,
            notes: item.category.notes,
            position: item.position,
            categoryChildren: [],
          });
        }
        continue;
      }

      // SUBCATEGORY
      else if (FormItemUtils.isSubcategoryType(item)) {
        const dbSubcategory = item.subcategory;
        if (!dbSubcategory) {
          throw new Error("Subcategory form item without subcategory data");
        }
        const category = categories.find(
          (c) => c.categoryId === dbSubcategory.categoryId,
        );
        if (!category) {
          throw new Error("Subcategory's category not found");
        }

        let subcategory = category.categoryChildren.find(
          (c): c is AssessmentSubcategoryItem =>
            FormItemUtils.isSubcategoryType(c) &&
            c.subcategoryId === item.subcategoryId,
        );

        if (!subcategory) {
          subcategory = {
            id: item.id,
            position: item.position,
            subcategoryId: item.subcategoryId,
            name: dbSubcategory.name,
            notes: dbSubcategory.notes,
            questions: [],
          };
          category.categoryChildren.push(subcategory);
        }
        continue;
      }

      // QUESTION
      else if (FormItemUtils.isQuestionType(item)) {
        const dbQuestion = item.question;
        if (!dbQuestion) {
          throw new Error("Question form item without question data");
        }
        totalQuestions++;
        if (dbQuestion.questionType === "WRITTEN") {
          if (
            dbQuestion.characterType === "NUMBER" ||
            dbQuestion.characterType === "PERCENTAGE" ||
            dbQuestion.characterType === "SCALE"
          ) {
            responsesFormValues[dbQuestion.id] =
              dbQuestion.response[0]?.response ?
                Number(dbQuestion.response[0].response)
              : null;
          } else {
            responsesFormValues[dbQuestion.id] =
              dbQuestion.response[0]?.response ?? null;
          }
        } else if (dbQuestion.questionType === "OPTIONS") {
          if (dbQuestion.optionType === "RADIO") {
            responsesFormValues[dbQuestion.id] =
              dbQuestion.ResponseOption[0]?.option?.id ?? null;
          } else if (dbQuestion.optionType === "CHECKBOX") {
            responsesFormValues[dbQuestion.id] = dbQuestion.ResponseOption.map(
              (r) => r.option!.id,
            );
          }
        } else if (dbQuestion.questionType === "BOOLEAN") {
          responsesFormValues[dbQuestion.id] =
            dbQuestion.booleanResponses[0]?.checked ?? false;
        }

        const relatedCalculation = form.calculations.find(
          (calc) => calc.targetQuestionId === item.questionId,
        );
        const question: AssessmentQuestionItem = {
          id: item.id,
          position: item.position,
          questionId: item.questionId,
          name: dbQuestion.name,
          iconKey: dbQuestion.iconKey,
          isPublic: dbQuestion.isPublic,
          scaleConfig: dbQuestion.scaleConfig,
          notes: dbQuestion.notes,
          questionType: dbQuestion.questionType,
          characterType: dbQuestion.characterType,
          optionType: dbQuestion.optionType,
          options: dbQuestion.options,
          geometryTypes: dbQuestion.geometryTypes,
          calculationExpression: relatedCalculation?.expression,
          categoryName: "placeholder", //Placeholder to be filled once the corresponding category is found
          subcategoryName: null, //It is also a placeholder. The reason we can set as null is because the type allows it
        };
        const category = categories.find(
          (c) => c.categoryId === dbQuestion.categoryId,
        );
        if (!category) {
          throw new Error("Question's category not found");
        }
        question.categoryName = category.name;
        if (dbQuestion.subcategoryId) {
          // question is inserted in a subcategory
          const subcategory = category.categoryChildren.find(
            (c): c is AssessmentSubcategoryItem =>
              FormItemUtils.isSubcategoryType(c) &&
              c.subcategoryId === dbQuestion.subcategoryId,
          );
          if (subcategory) {
            question.subcategoryName = subcategory.name;
            subcategory.questions.push(question);
          }
        } else {
          // question inserted directly in category
          category.categoryChildren.push(question);
        }
        continue;
      }
    }

    // Sorting by position
    categories.sort((a, b) => a.position - b.position);
    categories.forEach((cat) => {
      cat.categoryChildren.sort((a, b) => a.position - b.position);
      cat.categoryChildren.forEach((child) => {
        if (FormItemUtils.isSubcategoryType(child))
          child.questions.sort((a, b) => a.position - b.position);
      });
    });

    const rawGeometries = await fetchAssessmentGeometries(params.assessmentId);
    const geometries = rawGeometries.map((fetchedGeometry) => {
      const { questionId, geometry } = fetchedGeometry;
      if (!geometry) {
        return { questionId, geometries: [] };
      }
      const geometries: ResponseGeometry[] = [];
      const geometriesWithoutCollection = geometry
        .replace("GEOMETRYCOLLECTION(", "")
        .slice(0, -1);
      const regex = /(?:POINT|POLYGON)\([^)]*\)+/g;
      const geometriesStrs = geometriesWithoutCollection.match(regex);
      if (geometriesStrs) {
        for (const geometry of geometriesStrs) {
          if (geometry.startsWith("POINT")) {
            const geometryPointsStr = geometry
              .replace("POINT(", "")
              .replace(")", "");
            const geometryPoints = geometryPointsStr.split(" ");
            const geometryPointsNumber: number[] = [];
            for (const geo of geometryPoints) {
              geometryPointsNumber.push(Number(geo));
            }
            geometries.push({
              type: "Point",
              coordinates: geometryPointsNumber,
            });
          } else if (geometry.startsWith("POLYGON")) {
            const geometryRingsStr = geometry
              .replace("POLYGON(", " ")
              .slice(0, -1);
            const ringsStrs = geometryRingsStr.split("),(");
            const ringsCoordinates: Coordinate[][] = [];
            for (const ring of ringsStrs) {
              const geometryPointsStr = ring.split(",");
              const geometryPointsCoordinates: Coordinate[] = [];
              for (const point of geometryPointsStr) {
                const pointClean = point
                  .replace("(", "")
                  .replace(")", "")
                  .trim();
                const geometryPoints = pointClean.split(" ");
                const geometryPointsNumber: number[] = [];
                for (const geo of geometryPoints) {
                  geometryPointsNumber.push(Number(geo));
                }
                geometryPointsCoordinates.push(geometryPointsNumber);
              }
              ringsCoordinates.push(geometryPointsCoordinates);
            }
            geometries.push({ type: "Polygon", coordinates: ringsCoordinates });
          }
        }
      }

      return { questionId, geometries: geometries };
    });
    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        assessmentTree: {
          id: assessment.id,
          startDate: assessment.startDate,
          endDate: assessment.endDate,
          formName: assessment.form.name,
          location: {
            id: assessment.location.id,
            name: assessment.location.name,
          },
          user: {
            id: assessment.user.id,
            username: assessment.user.username,
          },
          totalQuestions: totalQuestions,
          responsesFormValues: responsesFormValues,
          geometries: geometries,
          categories: categories,
        },
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
      } as APIResponseInfo,
      data: null,
    };
  }
};
