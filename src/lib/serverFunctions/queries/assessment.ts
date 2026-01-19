import { prisma } from "@lib/prisma";
import {
  fetchAssessmentGeometries,
  fetchAssessmentsGeometries,
} from "@serverOnly/geometries";
import { Coordinate } from "ol/coordinate";

import { QuestionItem } from "../../../app/admin/forms/[formId]/edit/clientV2";
import { FormValues } from "../../../app/admin/parks/[locationId]/evaluation/[selectedFormId]/[selectedAssessmentId]/responseFormV2";
import { FetchAssessmentsParams } from "../../../app/api/admin/assessments/route";
import { ResponseGeometry } from "../../types/assessments/geometry";
import {
  APIResponse,
  APIResponseInfo,
} from "../../types/backendCalls/APIResponse";
import {
  generatePaginationResponseInfo,
  generatePrismaPaginationObject,
} from "../../utils/apiCall";
import { FormItemUtils } from "../../utils/formTreeUtils";

type FinalizedAssessmentsList = NonNullable<
  Awaited<ReturnType<typeof fetchAssessmentByLocationAndForm>>
>;

type AssessmentsWithResposes = NonNullable<
  Awaited<ReturnType<typeof fetchMultipleAssessmentsWithResponses>>
>;

export type AssessmentQuestionItem = Omit<QuestionItem, "options"> & {
  id: number;
  options?: {
    id: number;
    text: string;
  }[];
  response?: {
    text: string;
  };
  ResponseOption?: {
    option: {
      id: number;
    };
  };
  calculationExpression?: string;
};

export type AssessmentSubcategoryItem = {
  id: number;
  position: number;
  subcategoryId: number;
  name: string;
  notes: string | null;
  questions: AssessmentQuestionItem[];
};

export type AssessmentCategoryItem = {
  id: number;
  categoryId: number;
  name: string;
  notes: string | null;
  position: number;
  categoryChildren: (AssessmentQuestionItem | AssessmentSubcategoryItem)[];
};

const fetchAssessmentsInProgress = async (
  locationId: number,
  formId: number,
): Promise<{
  statusCode: number;
  assessments: Array<{
    id: number;
    startDate: Date;
    user: { username: string | null; id: string };
  }>;
}> => {
  try {
    const assessments = await prisma.assessment.findMany({
      where: {
        formId,
        locationId,
        endDate: null,
      },
      select: {
        id: true,
        startDate: true,
        user: {
          select: {
            username: true,
            id: true,
          },
        },
      },
    });
    return { statusCode: 200, assessments: assessments };
  } catch (e) {
    return { statusCode: 500, assessments: [] };
  }
};

const fetchAssessmentByLocationAndForm = async (
  locationId: number,
  formId: number,
) => {
  try {
    const assessments = await prisma.assessment.findMany({
      where: {
        locationId,
        formId,
        endDate: {
          not: null,
        },
      },
      select: {
        id: true,
        startDate: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });
    return { statusCode: 200, assessments: assessments };
  } catch (e) {
    return { statusCode: 500, assessments: [] };
  }
};

const fetchMultipleAssessmentsWithResponses = async (
  assessmentsIds: number[],
) => {
  try {
    const assessments = await prisma.assessment.findMany({
      where: {
        id: {
          in: assessmentsIds,
        },
      },
      include: {
        form: {
          include: {
            questions: {
              include: {
                options: true,
                category: true,
                subcategory: {
                  include: {
                    category: true,
                  },
                },
              },
            },
            calculations: {
              include: {
                questions: true,
              },
            },
          },
        },
        response: true,
        responseOption: {
          include: {
            option: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
    const geometriesGroups = await fetchAssessmentsGeometries(assessmentsIds);
    const returnObj = assessments.map((assessment) => {
      return {
        ...assessment,
        geometries: geometriesGroups.find(
          (geometriesGroup) =>
            geometriesGroup[0]?.assessmentId === assessment.id,
        ),
      };
    });
    return { statusCode: 200, assessments: returnObj };
  } catch (e) {
    return { statusCode: 500, assessments: [] };
  }
};

const fetchAssessmentWithResponses = async (assessmentId: number) => {
  // WARNING: Make sure to check if user has permission to see this assessemnt
  try {
    const assessment = await prisma.assessment.findUnique({
      where: {
        id: assessmentId,
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
        location: {
          select: {
            name: true,
          },
        },
        response: true,
        responseOption: {
          include: {
            option: true,
          },
        },
        form: {
          include: {
            questions: {
              include: {
                options: true,

                category: true,
                subcategory: {
                  include: {
                    category: true,
                  },
                },
              },
            },
            calculations: {
              include: {
                questions: true,
              },
            },
          },
        },
      },
    });

    const geometries = await fetchAssessmentGeometries(assessmentId);
    if (geometries && geometries.length > 0) {
      const returnObj = {
        statusCode: 200,
        assessment: assessment,
        geometries,
      };
      return returnObj;
    }
    return { statusCode: 200, assessment: assessment, geometries: [] };
  } catch (e) {
    return { statusCode: 500, assessment: null, geometries: [] };
  }
};

export type FetchRecentlyCompletedAssessmentsResponse = NonNullable<
  Awaited<ReturnType<typeof fetchRecentlyCompletedAssessments>>["data"]
>;
const fetchRecentlyCompletedAssessments = async () => {
  try {
    const assessments = await prisma.assessment.findMany({
      where: {
        NOT: {
          endDate: null,
        },
      },
      orderBy: {
        endDate: "desc",
      },
      select: {
        id: true,
        endDate: true,
        startDate: true,
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
          },
        },
        user: {
          select: {
            username: true,
          },
        },
      },
      take: 10,
    });
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

const getAssessmentTree = async (params: { assessmentId: number }) => {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: params.assessmentId },
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
                  select: {
                    id: true,
                    name: true,
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
    if (!assessment) throw new Error("Assessment not found");
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
          if (dbQuestion.characterType === "NUMBER") {
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
        }

        const relatedCalculation = form.calculations.find(
          (calc) => calc.targetQuestionId === item.questionId,
        );
        const question: AssessmentQuestionItem = {
          id: item.id,
          position: item.position,
          questionId: item.questionId,
          name: dbQuestion.name,
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
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
      } as APIResponseInfo,
      assessmentTree: null,
    };
  }
};

type FetchAssessmentsResponse = NonNullable<
  Awaited<ReturnType<typeof fetchAssessments>>["data"]
>;

const fetchAssessments = async (params: FetchAssessmentsParams) => {
  console.log("Fetching assessments with params:", params);
  try {
    const assessments = await prisma.assessment.findMany({
      where: {
        startDate: {
          gte: params.startDate,
          lte: params.endDate,
        },
        formId: params.formId,
        userId: params.userId,
        location: {
          id: params.locationId,
          cityId: params.cityId,
          narrowAdministrativeUnitId: params.narrowUnitId,
          intermediateAdministrativeUnitId: params.intermediateUnitId,
          broadAdministrativeUnitId: params.broadUnitId,
        },
      },
      orderBy: {
        startDate: "desc",
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        user: {
          select: {
            username: true,
          },
        },
        form: {
          select: {
            name: true,
          },
        },
        location: {
          select: {
            name: true,
          },
        },
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

export {
  fetchAssessmentsInProgress,
  fetchAssessmentByLocationAndForm,
  fetchMultipleAssessmentsWithResponses,
  fetchAssessmentWithResponses,
  fetchRecentlyCompletedAssessments,
  getAssessmentTree,
  fetchAssessments,
};
export {
  type FinalizedAssessmentsList,
  type AssessmentsWithResposes,
  type FetchAssessmentsResponse,
};
