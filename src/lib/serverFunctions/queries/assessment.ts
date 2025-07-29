import { prisma } from "@lib/prisma";
import {
  fetchAssessmentGeometries,
  fetchAssessmentsGeometries,
} from "@serverOnly/geometries";

type FinalizedAssessmentsList = NonNullable<
  Awaited<ReturnType<typeof fetchAssessmentByLocationAndForm>>
>;

type AssessmentsWithResposes = NonNullable<
  Awaited<ReturnType<typeof fetchMultipleAssessmentsWithResponses>>
>;

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
  console.time();
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
    console.timeEnd();
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

export {
  fetchAssessmentsInProgress,
  fetchAssessmentByLocationAndForm,
  fetchMultipleAssessmentsWithResponses,
  fetchAssessmentWithResponses,
  fetchRecentlyCompletedAssessments,
};
export { type FinalizedAssessmentsList, type AssessmentsWithResposes };
