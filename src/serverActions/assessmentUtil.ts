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
type LocationAssessment = NonNullable<
  Awaited<ReturnType<typeof fetchAssessmentsByLocation>>
>[number];

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

const fetchAssessmentsByLocation = async (locationId: number) => {
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
  return assessments;
};

const fetchAssessmentGeometries = async (assessmentId: number) => {
  const geometries = await prisma.$queryRaw<
    { assessmentId: number; questionId: number; geometry: string | null }[]
  >`
    SELECT assessment_id as "assessmentId", question_id as "questionId", ST_AsText(geometry) as geometry
    FROM question_geometry
    WHERE assessment_id = ${assessmentId}
  `;

  return geometries;
};

const fetchAssessmentsGeometries = async (assessmentsIds: number[]) => {
  const geometries = await Promise.all(
    assessmentsIds.flatMap((a) => fetchAssessmentGeometries(a)),
  );
  return geometries;
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
          calculations: {
            include: {
              questions: true,
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
  fetchAssessmentGeometries,
  fetchAssessmentsInProgresss,
  fetchAssessmentsForAssessmentList,
  fetchMultipleAssessmentsWithResponses,
  fetchAssessmentWithResponses,
  redirectToFormsList,
  fetchAssessmentsByLocation,
  fetchAssessmentsGeometries,
};

export {
  type AssessmentsWithResposes,
  type FinalizedAssessmentsList,
  type LocationAssessment,
};
