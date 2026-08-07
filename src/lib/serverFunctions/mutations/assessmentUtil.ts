import { prisma } from "@/lib/prisma";
import { auth } from "@lib/auth/auth";
import { getSessionUser } from "@lib/auth/userUtil";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { z } from "zod";

import { APIResponseInfo } from "../../types/backendCalls/APIResponse";

export const createAssessmentDataSchema = z.instanceof(FormData);
export type CreateAssessmentData = z.infer<typeof createAssessmentDataSchema>;
export type CreateAssessmentResponse = NonNullable<
  Awaited<ReturnType<typeof _createAssessmentV2>>["data"]
>;

const _createAssessmentV2 = async (formData: CreateAssessmentData) => {
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
      return {
        responseInfo: {
          statusCode: 201,
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

export const updateAssessmentVisibilityDataSchema = z.object({
  assessmentId: z.coerce.number(),
  isPublic: z.boolean(),
});
export type UpdateAssessmentVisibilityData = z.infer<
  typeof updateAssessmentVisibilityDataSchema
>;

const _updateAssessmentVisibility = async ({
  assessmentId,
  isPublic,
}: UpdateAssessmentVisibilityData) => {
  try {
    const updatedAssessment = await prisma.assessment.update({
      where: { id: assessmentId, isFinalized: isPublic ? true : undefined },
      data: { isPublic: isPublic },
    });
    if (!updatedAssessment) {
      throw new Error();
    }
    return {
      responseInfo: {
        statusCode: 200,
        message: "Visibilidade da avaliação atualizada!",
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

export const deleteAssessmentDataSchema = z.object({
  assessmentId: z.coerce.number(),
});
export type DeleteAssessmentData = z.infer<typeof deleteAssessmentDataSchema>;

const _deleteAssessment = async ({ assessmentId }: DeleteAssessmentData) => {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: {
        id: assessmentId,
      },
      select: {
        userId: true,
      },
    });
    if (!assessment) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Avaliação não encontrada!",
        } as APIResponseInfo,
      };
    }
    const user = await getSessionUser();
    if (assessment.userId !== user?.id) {
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
    await prisma.$transaction([
      prisma.questionGeometry.deleteMany({
        where: {
          assessmentId,
        },
      }),
      prisma.response.deleteMany({
        where: {
          assessmentId,
        },
      }),
      prisma.responseOption.deleteMany({
        where: {
          assessmentId,
        },
      }),
      prisma.assessment.delete({
        where: {
          id: assessmentId,
        },
      }),
    ]);
    return {
      responseInfo: {
        statusCode: 200,
        message: "Avaliação excluída!",
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
