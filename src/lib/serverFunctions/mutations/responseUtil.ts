import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@auth/userUtil";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { z } from "zod";

import {
  APIRequestData,
  APIResponseInfo,
} from "../../types/backendCalls/APIResponse";
import {
  formSubmissionDataSchema,
  getFormSubmissionUpdateTransactions,
} from "./formSubmission";

export const assessmentSubmitDataSchema = z.object({
  assessmentId: z.coerce.number(),
  formSubmission: formSubmissionDataSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable(),
  isFinalized: z.boolean(),
  driveFolderUrl: z.string().nullable(),
});
export type AssessmentSubmitData = z.infer<typeof assessmentSubmitDataSchema>;
export type AssessmentSubmitResponse = NonNullable<
  Awaited<ReturnType<typeof assessmentSubmit>>["data"]
>;

const assessmentSubmit = async (
  request: APIRequestData<AssessmentSubmitData>,
) => {
  const {
    assessmentId,
    formSubmission,
    startDate,
    endDate,
    isFinalized,
    driveFolderUrl,
  } = request.data!;

  try {
    const user = await getSessionUser();
    if (!user) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Erro na autenticação!",
        } as APIResponseInfo,
      };
    }

    const assessment = await prisma.assessment.findUnique({
      where: {
        id: assessmentId,
      },
      select: {
        userId: true,
        isPublic: true,
        formSubmissionId: true,
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

    if (user.id !== assessment.userId) {
      try {
        await checkIfLoggedInUserHasAnyPermission({
          roles: ["ASSESSMENT_MANAGER"],
        });
      } catch {
        return {
          responseInfo: {
            statusCode: 401,
            message: "Sem permissão para editar esta avaliação!",
          } as APIResponseInfo,
        };
      }
    }

    const formSubmissionTransactions =
      await getFormSubmissionUpdateTransactions({
        formSubmissionId: assessment.formSubmissionId,
        formSubmission,
        userId: user.id,
      });

    const assessmentUpdate = prisma.assessment.update({
      where: {
        id: assessmentId,
      },
      select: {
        updatedAt: true,
        isFinalized: true,
      },
      data: {
        startDate,
        endDate,
        isFinalized,
        isPublic: !isFinalized ? false : assessment.isPublic,
        driveFolderUrl,
      },
    });

    const [updatedAssessment] = await prisma.$transaction([
      assessmentUpdate,
      ...formSubmissionTransactions,
    ]);

    if (
      !updatedAssessment ||
      typeof updatedAssessment === "number" ||
      !("updatedAt" in updatedAssessment)
    ) {
      throw new Error("Resultado inesperado ao salvar avaliação");
    }

    return {
      responseInfo: {
        statusCode: 201,
        message: "Avaliação salva!",
      } as APIResponseInfo,
      data: {
        savedAsFinalized: updatedAssessment.isFinalized,
        updatedAt: updatedAssessment.updatedAt,
      },
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao salvar avaliação!",
      } as APIResponseInfo,
    };
  }
};

export { assessmentSubmit };
