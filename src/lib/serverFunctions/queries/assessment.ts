import { prisma } from "@lib/prisma";
import {
  fetchAssessmentGeometries,
  fetchAssessmentsGeometries,
} from "@serverOnly/geometries";

import { QuestionItem } from "../../../app/admin/forms/[formId]/edit/clientV2";
import { APIResponseInfo } from "../../types/backendCalls/APIResponse";
import { FormItemUtils } from "../../utils/formTreeUtils";

type FinalizedAssessmentsList = NonNullable<
  Awaited<ReturnType<typeof fetchAssessmentByLocationAndForm>>
>;

type AssessmentsWithResposes = NonNullable<
  Awaited<ReturnType<typeof fetchMultipleAssessmentsWithResponses>>
>;

export type AssessmentQuestionItem = QuestionItem & {
  id: number;
  response?: {
    text: string;
  };
  ResponseOption?: {
    option: {
      text: string;
    };
  };
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
    return { statusCode: 200, assessments };
  } catch (e) {
    return { statusCode: 500, assessments: [] };
  }
};

const getAssessmentTree = async (params: { assessmentId: number }) => {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: params.assessmentId },
      select: {
        id: true,
        form: {
          select: {
            id: true,
            name: true,
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
                    options: { select: { text: true } },
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
                      },
                      select: {
                        id: true,
                        option: {
                          select: {
                            text: true,
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

    console.log(assessment.form);

    const sortedFormItems = form.formItems.sort((a, b) => {
      const rankDiff =
        FormItemUtils.getItemRankForSorting(a) -
        FormItemUtils.getItemRankForSorting(b);
      if (rankDiff !== 0) return rankDiff;

      return a.position - b.position;
    });

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
        };
        const category = categories.find(
          (c) => c.categoryId === dbQuestion.categoryId,
        );
        if (!category) {
          throw new Error("Question's category not found");
        }
        if (dbQuestion.subcategoryId) {
          // question is inserted in a subcategory
          const subcategory = category.categoryChildren.find(
            (c): c is AssessmentSubcategoryItem =>
              FormItemUtils.isSubcategoryType(c) &&
              c.subcategoryId === dbQuestion.subcategoryId,
          );
          if (subcategory) {
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

    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      assessmentTree: {
        id: assessment.id,
        formName: assessment.form.name,
        categories: categories,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      assessmentTree: null,
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
};
export { type FinalizedAssessmentsList, type AssessmentsWithResposes };
