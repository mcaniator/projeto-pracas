"use server";

import { prisma } from "@/lib/prisma";
import { AssessmentCreationFormType } from "@customTypes/assessments/assessmentCreation";
import { auth } from "@lib/auth/auth";
import { getSessionUser } from "@lib/auth/userUtil";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { revalidatePath } from "next/cache";

type LocationAssessment = NonNullable<
  Awaited<ReturnType<typeof _fetchAssessmentsByLocation>>
>["assessments"][number];

const _createAssessment = async (
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

const _fetchAssessmentsByLocation = async (locationId: number) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["ASSESSMENT"] });
  } catch (e) {
    return { statusCode: 401, assessments: [] };
  }
  try {
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
    return { statusCode: 200, assessments };
  } catch (e) {
    return { statusCode: 500, assessments: [] };
  }
};

const _deleteAssessment = async (assessmentId: number) => {
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

export { _createAssessment, _deleteAssessment, _fetchAssessmentsByLocation };

export { type LocationAssessment };
