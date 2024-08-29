"use server";

import { AssessmentCreationFormType } from "@/app/admin/parks/[locationId]/evaluation/[selectedFormId]/assessmentCreation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

const fetchAssessmentsByLocationAndForm = async (
  locationId: number,
  formId: number,
) => {
  const assessments = await prisma.assessment.findMany({
    where: {
      locationId,
      formId,
    },
    include: {
      form: {
        include: {
          questions: true,
        },
      },
      response: true,
      responseOption: true,
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
      form: {
        include: {
          questions: {
            include: {
              options: true,
              response: true,
              ResponseOption: {
                include: {
                  option: true,
                },
              },
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
    console.log(e);
  }
};

export {
  createAssessment,
  deleteAssessment,
  fetchAssessmentsInProgresss,
  fetchAssessmentsByLocationAndForm,
  fetchAssessmentWithResponses,
};
