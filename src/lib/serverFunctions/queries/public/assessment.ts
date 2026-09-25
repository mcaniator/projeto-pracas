import { prisma } from "@/lib/prisma";
import {
  type FetchAssessmentDetailsResponse,
  fetchAssessmentDetails,
} from "@/lib/serverFunctions/queries/assessment";
import {
  APIRequestParams,
  APIResponseInfo,
} from "@/lib/types/backendCalls/APIResponse";
import { z } from "zod";

export const publicFetchPublicAssessmentsParamsSchema = z.object({
  locationId: z.coerce.number().optional(),
});

export type PublicFetchPublicAssessmentsParams = z.infer<
  typeof publicFetchPublicAssessmentsParamsSchema
>;

export type PublicFetchPublicAssessmentsResponse = NonNullable<
  Awaited<ReturnType<typeof publicFetchPublicAssessments>>["data"]
>;

export const publicFetchPublicAssessments = async (
  request: APIRequestParams<PublicFetchPublicAssessmentsParams>,
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
  } catch {
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

export const publicFetchPublicAssessmentDetailsParamsSchema = z.object({
  assessmentId: z.number().int().positive(),
});

export type PublicFetchPublicAssessmentDetailsParams = z.infer<
  typeof publicFetchPublicAssessmentDetailsParamsSchema
>;

export type PublicFetchPublicAssessmentDetailsResponse =
  FetchAssessmentDetailsResponse;

export const publicFetchPublicAssessmentDetails = (
  request: APIRequestParams<PublicFetchPublicAssessmentDetailsParams>,
) =>
  fetchAssessmentDetails({
    params: {
      assessmentId: request.params!.assessmentId,
      isPublic: true,
    },
  });
