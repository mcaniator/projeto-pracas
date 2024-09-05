"use server";

import { AssessmentCreationFormType } from "@/app/admin/parks/[locationId]/evaluation/[selectedFormId]/assessmentCreation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type AssessmentsWithResposes = NonNullable<
  Awaited<ReturnType<typeof fetchMultipleAssessmentsWithResponses>>
>;
type FinalizedAssessmentsList = NonNullable<
  Awaited<ReturnType<typeof fetchAssessmentsForAssessmentList>>
>;
const createAssessment = async (
  prevState: AssessmentCreationFormType | undefined,
  formData: FormData,
) => {
  const locationId = formData.get("locationId") as string;
  const userId = formData.get("userId") as string;
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
        },
      },
    },
  });
  return assessments;
};

const fetchAssessmentsForAssessmentList = async (
  locationId: number,
  formId: number,
) => {
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
  return assessments;
};

const fetchMultipleAssessmentsWithResponses = async (
  assessmentsIds: number[],
) => {
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
  return assessments;
};

const fetchAssessmentWithResponses = async (assessmentId: number) => {
  const assessment = await prisma.assessment.findUnique({
    where: {
      id: assessmentId,
    },
    include: {
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
        },
      },
    },
  });
  return assessment;
};

const deleteAssessment = async (assessmentId: number) => {
  try {
    await prisma.assessment.delete({
      where: {
        id: assessmentId,
      },
    });
  } catch (e) {
    return {
      statusCode: 2,
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
  fetchAssessmentsForAssessmentList,
  fetchMultipleAssessmentsWithResponses,
  fetchAssessmentWithResponses,
  redirectToFormsList,
};

export { type AssessmentsWithResposes, type FinalizedAssessmentsList };
