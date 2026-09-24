import { FINALIZATION_STATUS } from "@/lib/enums/finalizationStatus";
import { prisma } from "@lib/prisma";
import { z } from "zod";

import {
  APIRequest,
  APIRequestParams,
  APIResponseInfo,
} from "../../types/backendCalls/APIResponse";
import { getFormSubmissionData } from "./formSubmission";

export type {
  FormSubmissionCategoryItem as AssessmentCategoryItem,
  FormSubmissionQuestionItem as AssessmentQuestionItem,
  FormSubmissionSubcategoryItem as AssessmentSubcategoryItem,
} from "./formSubmission";

export type GetRecentlyCompletedAssessmentsResponse = NonNullable<
  Awaited<ReturnType<typeof getRecentlyCompletedAssessments>>["data"]
>;
const getRecentlyCompletedAssessments = async () => {
  try {
    const assessments = await prisma.assessment.findMany({
      where: {
        isFinalized: true,
      },
      orderBy: {
        endDate: "desc",
      },
      select: {
        id: true,
        endDate: true,
        isFinalized: true,
        startDate: true,
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
    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        assessments,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar avaliações!",
      } as APIResponseInfo,
      data: {
        assessments: [],
      },
    };
  }
};

export type FetchAssessmentUsersResponse = NonNullable<
  Awaited<ReturnType<typeof fetchAssessmentUsers>>
>["data"];

export const fetchAssessmentUsers = async (_request: APIRequest) => {
  try {
    const users = await prisma.user.findMany({
      where: { assessment: { some: {} } },
      select: { id: true, username: true },
    });
    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        users,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar avaliadores!",
      } as APIResponseInfo,
      data: {
        users: [],
      },
    };
  }
};

export const fetchAssessmentTreeParamsSchema = z.object({
  assessmentId: z.coerce.number().int().positive(),
});

export type FetchAssessmentTreeParams = z.infer<
  typeof fetchAssessmentTreeParamsSchema
>;

export type FetchAssessmentTreeResponse = NonNullable<
  Awaited<ReturnType<typeof fetchAssessmentTree>>["data"]
>;

type AssessmentLocationPolygon = {
  st_asgeojson: string | null;
};

const fetchAssessmentTree = async (
  request: APIRequestParams<{
    assessmentId: number;
    isPublic?: boolean;
  }>,
) => {
  const params = request.params!;
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: params.assessmentId, isPublic: params.isPublic },
      select: {
        id: true,
        endDate: true,
        isFinalized: true,
        startDate: true,
        updatedAt: true,
        driveFolderUrl: true,
        formSubmissionId: true,
        user: {
          select: {
            username: true,
            id: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!assessment) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Avaliação não encontrada!",
        } as APIResponseInfo,
        data: null,
      };
    }

    const [locationPolygon, formSubmission] = await Promise.all([
      prisma.$queryRaw<Array<AssessmentLocationPolygon>>`
        SELECT
          CASE
            WHEN ST_IsEmpty(l.polygon) THEN NULL
            ELSE ST_AsGeoJSON(l.polygon)::text
          END AS st_asgeojson
        FROM location l
        WHERE l.id = ${assessment.location.id}
      `,
      getFormSubmissionData({
        formSubmissionId: assessment.formSubmissionId,
        includeCalculations: !params.isPublic,
        publicQuestionsOnly: params.isPublic,
      }),
    ]);

    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        assessmentTree: {
          id: assessment.id,
          startDate: assessment.startDate,
          endDate: assessment.endDate,
          isFinalized: assessment.isFinalized,
          updatedAt: assessment.updatedAt,
          driveFolderUrl: assessment.driveFolderUrl,
          location: {
            id: assessment.location.id,
            name: assessment.location.name,
            st_asgeojson: locationPolygon[0]?.st_asgeojson ?? null,
          },
          user: assessment.user,
          formSubmission,
        },
      },
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao buscar avaliação!",
      } as APIResponseInfo,
      data: null,
    };
  }
};

export type GetPublicAssessmentTreeResponse = NonNullable<
  Awaited<ReturnType<typeof getPublicAssessmentTree>>["data"]
>;

const getPublicAssessmentTree = async (params: { assessmentId: number }) =>
  fetchAssessmentTree({
    params: {
      assessmentId: params.assessmentId,
      isPublic: true,
    },
  });

export const fetchAssessmentsParamsSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  formId: z.coerce.number().optional(),
  userId: z.string().optional(),
  locationId: z.coerce.number().optional(),
  narrowUnitId: z.coerce.number().optional(),
  intermediateUnitId: z.coerce.number().optional(),
  broadUnitId: z.coerce.number().optional(),
  cityId: z.coerce.number().optional(),
  finalizationStatus: z.coerce.number().optional(),
});

export type FetchAssessmentsParams = z.infer<
  typeof fetchAssessmentsParamsSchema
>;

export type FetchAssessmentsResponse = NonNullable<
  Awaited<ReturnType<typeof fetchAssessments>>["data"]
>;

const fetchAssessments = async (
  request: APIRequestParams<FetchAssessmentsParams>,
) => {
  const params = request.params!;
  try {
    let isFinalizedFilter = undefined;
    if (params.finalizationStatus === FINALIZATION_STATUS.FINALIZED) {
      isFinalizedFilter = true;
    } else if (
      params.finalizationStatus === FINALIZATION_STATUS.NOT_FINALIZED
    ) {
      isFinalizedFilter = false;
    }
    const assessments = await prisma.assessment.findMany({
      where: {
        startDate: {
          gte: params.startDate,
          lte: params.endDate,
        },
        isFinalized: isFinalizedFilter,
        formId: params.formId,
        userId: params.userId,
        location: {
          id: params.locationId,
          cityId: params.cityId,
          narrowAdministrativeUnitId: params.narrowUnitId,
          intermediateAdministrativeUnitId: params.intermediateUnitId,
          broadAdministrativeUnitId: params.broadUnitId,
        },
      },
      orderBy: {
        startDate: "desc",
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        isFinalized: true,
        isPublic: true,
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
        location: {
          select: {
            name: true,
          },
        },
      },
    });
    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: {
        assessments,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar avaliações!",
      } as APIResponseInfo,
      data: {
        assessments: [],
      },
    };
  }
};

export const fetchPublicAssessmentsParamsSchema = z.object({
  locationId: z.coerce.number().optional(),
});

export type FetchPublicAssessmentsParams = z.infer<
  typeof fetchPublicAssessmentsParamsSchema
>;

export type FetchPublicAssessmentsResponse = NonNullable<
  Awaited<ReturnType<typeof fetchPublicAssessments>>["data"]
>;

export const fetchPublicAssessments = async (
  request: APIRequestParams<FetchPublicAssessmentsParams>,
) => {
  const params = request.params!;
  try {
    const assessments = await prisma.assessment.findMany({
      where: {
        isPublic: true,
        location: {
          id: params.locationId,
        },
      },
      orderBy: {
        startDate: "desc",
      },
      select: {
        id: true,
        startDate: true,
      },
    });
    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: {
        assessments,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar avaliações!",
      } as APIResponseInfo,
      data: {
        assessments: [],
      },
    };
  }
};

export {
  getRecentlyCompletedAssessments,
  fetchAssessmentTree,
  fetchAssessments,
  getPublicAssessmentTree,
};
