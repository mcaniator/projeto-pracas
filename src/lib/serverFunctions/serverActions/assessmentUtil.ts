"use server";

import { prisma } from "@/lib/prisma";
import { AssessmentCreationFormType } from "@customTypes/assessments/assessmentCreation";
import { auth } from "@lib/auth/auth";
import { getSessionUser } from "@lib/auth/userUtil";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { APIResponseInfo } from "../../types/backendCalls/APIResponse";

export type LocationAssessment = NonNullable<
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

const _createAssessmentV2 = async (
  prevState: { responseInfo: APIResponseInfo },
  formData: FormData,
) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({
      roles: ["ASSESSMENT_EDITOR", "ASSESSMENT_MANAGER"],
    });
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 401,
        message: "Permissão inválida!",
      } as APIResponseInfo,
    };
  }
  const session = await auth();
  if (!session || !session.user) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Não foi possível obter os dados do usuário logado!",
      } as APIResponseInfo,
    };
  }
  try {
    const locationId = z.coerce.number().parse(formData.get("locationId"));
    const userId = z.string().parse(session.user.id);
    const formId = z.coerce.number().parse(formData.get("formId"));
    const startDate = z.coerce.date().parse(formData.get("startDate"));
    try {
      await prisma.assessment.create({
        data: {
          startDate: new Date(startDate),
          user: { connect: { id: userId } },
          location: { connect: { id: Number(locationId) } },
          form: { connect: { id: Number(formId) } },
        },
      });
      revalidateTag("assessemnt");
      return {
        responseInfo: {
          statusCode: 201,
          showSuccessCard: true,
          message: `Avaliação criada!`,
        } as APIResponseInfo,
      };
    } catch (error) {
      return {
        responseInfo: {
          statusCode: 500,
          message: "Erro ao criar avaliação!",
        } as APIResponseInfo,
      };
    }
  } catch (e) {
    console.log(e);
    return {
      responseInfo: {
        statusCode: 400,
        message: "Dados inválidos!",
      } as APIResponseInfo,
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
      },
    });
    const result = assessments.map((a) => ({
      id: a.id,
      startDate: a.startDate,
      endDate: a.endDate,
      username: a.user.username!,
      formName: a.form.name,
      status: a.endDate ? "Finalizada" : "Em progresso",
    }));
    return { statusCode: 200, assessments: result };
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
    return {
      responseInfo: {
        statusCode: 401,
        message: "Sem permissão para excluir avaliação!",
      } as APIResponseInfo,
    };
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
        return {
          responseInfo: {
            statusCode: 401,
            message: "Sem permissão para excluir avaliação!",
          } as APIResponseInfo,
        };
      }
    }
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao excluir avaliação!",
      } as APIResponseInfo,
    };
  }
  try {
    await prisma.assessment.delete({
      where: {
        id: assessmentId,
      },
    });
    return {
      responseInfo: {
        statusCode: 200,
        message: "Avaliação excluída!",
        showSuccessCard: true,
      } as APIResponseInfo,
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao excluir avaliação!",
      } as APIResponseInfo,
    };
  }
};

export {
  _createAssessment,
  _createAssessmentV2,
  _deleteAssessment,
  _fetchAssessmentsByLocation,
};
