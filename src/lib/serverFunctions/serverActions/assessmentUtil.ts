"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@lib/auth/auth";
import { getSessionUser } from "@lib/auth/userUtil";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { revalidateTag } from "next/cache";
import { z } from "zod";

import { APIResponseInfo } from "../../types/backendCalls/APIResponse";

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
      const assessment = await prisma.assessment.create({
        data: {
          startDate: new Date(startDate),
          user: { connect: { id: userId } },
          location: { connect: { id: Number(locationId) } },
          form: { connect: { id: Number(formId) } },
        },
        select: {
          id: true,
        },
      });
      revalidateTag("assessemnt");
      return {
        responseInfo: {
          statusCode: 201,
          showSuccessCard: true,
          message: `Avaliação criada!`,
        } as APIResponseInfo,
        data: {
          assessmentId: assessment.id,
        },
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
    return {
      responseInfo: {
        statusCode: 400,
        message: "Dados inválidos!",
      } as APIResponseInfo,
    };
  }
};

const _updateAssessmentVisibility = async ({
  assessmentId,
  isPublic,
}: {
  assessmentId: number;
  isPublic: boolean;
}) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({
      roles: ["ASSESSMENT_MANAGER"],
    });
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 401,
        message: "Permissão inválida!",
      } as APIResponseInfo,
    };
  }
  try {
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: { isPublic: isPublic },
    });
    revalidateTag("assessemnt");
    return {
      responseInfo: {
        statusCode: 200,
        message: "Visibilidade da avaliação atualizada!",
        showSuccessCard: true,
      } as APIResponseInfo,
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao atualizar visibilidade da avaliação!",
      } as APIResponseInfo,
    };
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

export { _createAssessmentV2, _deleteAssessment, _updateAssessmentVisibility };
