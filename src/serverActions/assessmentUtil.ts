"use server";

import { AssessmentCreationFormType } from "@/app/admin/parks/[locationId]/evaluation/[selectedFormId]/assessmentCreation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "../lib/auth/auth";
import { getSessionUser } from "../lib/auth/userUtil";
import { checkIfLoggedInUserHasAnyPermission } from "../serverOnly/checkPermission";
import {
  fetchAssessmentGeometries,
  fetchAssessmentsGeometries,
} from "../serverOnly/geometries";

type AssessmentsWithResposes = NonNullable<
  Awaited<ReturnType<typeof fetchMultipleAssessmentsWithResponses>>
>;
type FinalizedAssessmentsList = NonNullable<
  Awaited<ReturnType<typeof fetchAssessmentByLocationAndForm>>
>;
type LocationAssessment = NonNullable<
  Awaited<ReturnType<typeof fetchAssessmentsByLocation>>
>[number];

const createAssessment = async (
  prevState: AssessmentCreationFormType | undefined,
  formData: FormData,
) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({
      roles: ["ASSESSMENT_EDITOR", "ASSESSMENT_MANAGER"],
    });
  } catch (e) {
    return {
      statusCode: 401,
      locationId: "",
      userId: "",
      formId: "",
      startDate: "",
      errors: {
        startDate: false,
      },
    };
  }
  const session = await auth();
  if (!session || !session.user) {
    return {
      statusCode: 401,
      locationId: "",
      userId: "",
      formId: "",
      startDate: "",
      errors: {
        startDate: false,
      },
    };
  }
  const locationId = formData.get("locationId") as string;
  const userId = session.user.id;
  const formId = formData.get("formId") as string;
  const startDate = formData.get("startDate") as string;
  try {
    await prisma.assessment.create({
      data: {
        startDate: new Date(startDate),
        user: { connect: { id: userId } },
        location: { connect: { id: Number(locationId) } },
        form: { connect: { id: Number(formId) } },
      },
    });
    revalidatePath("/");
    return {
      statusCode: 201,
      locationId,
      userId,
      formId,
      startDate,
      errors: {
        startDate: !startDate,
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      locationId,
      userId,
      formId,
      startDate,
      errors: {
        startDate: !startDate,
      },
    };
  }
};

const fetchAssessmentsInProgresss = async (
  locationId: number,
  formId: number,
) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({
      roles: ["ASSESSMENT_EDITOR", "ASSESSMENT_MANAGER"],
    });
  } catch (e) {
    return { statusCode: 401, assessments: [] };
  }
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

const fetchAssessmentsByLocation = async (locationId: number) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["ASSESSMENT"] });
    const assessments = await prisma.assessment.findMany({
      where: {
        locationId,
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
        form: {
          select: {
            name: true,
            version: true,
          },
        },
      },
    });
    return assessments;
  } catch (e) {
    return null;
  }
};

const fetchAssessmentByLocationAndForm = async (
  locationId: number,
  formId: number,
) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["ASSESSMENT"] });
  } catch (e) {
    return { statusCode: 401, assessments: [] };
  }
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
    await checkIfLoggedInUserHasAnyPermission({
      roleGroups: ["ASSESSMENT"],
    });
  } catch (e) {
    return { statusCode: 401, assessments: [] };
  }
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
  try {
    await checkIfLoggedInUserHasAnyPermission({
      roles: ["ASSESSMENT_EDITOR", "ASSESSMENT_MANAGER"],
    });
  } catch (e) {
    return { statusCode: 401, assessment: null, geometries: [] };
  }
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
    const user = await getSessionUser();
    if (assessment?.userId !== user?.id) {
      try {
        await checkIfLoggedInUserHasAnyPermission({
          roles: ["ASSESSMENT_MANAGER"],
        });
      } catch (e) {
        return { statusCode: 401, assessment: null, geometries: [] };
      }
    }
    const geometries = await fetchAssessmentGeometries(assessmentId);
    if (geometries && geometries.length > 0) {
      const returnObj = {
        statusCode: 200,
        assessment: { ...assessment },
        geometries,
      };
      return returnObj;
    }
    return { statusCode: 200, assessment: { ...assessment }, geometries: [] };
  } catch (e) {
    return { statusCode: 500, assessment: null, geometries: [] };
  }
};

const fetchRecentlyCompletedAssessments = async () => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["ASSESSMENT"] });
  } catch (e) {
    return { statusCode: 401, assessments: [] };
  }
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

const deleteAssessment = async (assessmentId: number) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({
      roles: ["ASSESSMENT_EDITOR", "ASSESSMENT_MANAGER"],
    });
  } catch (e) {
    return { statusCode: 401 };
  }
  try {
    const assessment = await prisma.assessment.findUnique({
      where: {
        id: assessmentId,
      },
      select: {
        userId: true,
      },
    });
    const user = await getSessionUser();
    if (!assessment || assessment?.userId !== user?.id) {
      try {
        await checkIfLoggedInUserHasAnyPermission({
          roles: ["ASSESSMENT_MANAGER"],
        });
      } catch (e) {
        return { statusCode: 401 };
      }
    }
  } catch (e) {
    return { statusCode: 500 };
  }
  try {
    await prisma.assessment.delete({
      where: {
        id: assessmentId,
      },
    });
    return { statusCode: 200 };
  } catch (e) {
    return {
      statusCode: 500,
    };
  }
};

const redirectToFormsList = (locationId: number) => {
  redirect(`/admin/parks/${locationId}/evaluation`);
};

export {
  createAssessment,
  deleteAssessment,
  fetchAssessmentsInProgresss,
  fetchAssessmentByLocationAndForm,
  fetchMultipleAssessmentsWithResponses,
  fetchAssessmentWithResponses,
  redirectToFormsList,
  fetchAssessmentsByLocation,
  fetchRecentlyCompletedAssessments,
};

export {
  type AssessmentsWithResposes,
  type FinalizedAssessmentsList,
  type LocationAssessment,
};
