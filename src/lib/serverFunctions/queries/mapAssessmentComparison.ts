import { z } from "zod";

import { prisma } from "../../prisma";
import {
  APIRequest,
  APIRequestParams,
  APIResponseInfo,
} from "../../types/backendCalls/APIResponse";
import { buildImageUrl } from "../../utils/image";
import {
  type GetFormSubmissionDataResult,
  getFormSubmissionData,
} from "./formSubmission";
import {
  MapAssessmentComparisonCategory,
  MapAssessmentComparisonLocation,
  sortMapAssessmentComparisonLocations,
} from "./mapAssessmentComparisonUtils";

export type {
  MapAssessmentComparisonAssessment,
  MapAssessmentComparisonCategory,
  MapAssessmentComparisonLocation,
} from "./mapAssessmentComparisonUtils";

export type FetchMapAssessmentComparisonCategoriesResponse = NonNullable<
  Awaited<ReturnType<typeof fetchMapAssessmentComparisonCategories>>["data"]
>;

export const fetchMapAssessmentComparisonCategories = async (
  _request: APIRequest,
) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        formItems: {
          some: {
            questionId: {
              not: null,
            },
            question: {
              isPublic: true,
            },
            form: {
              assessment: {
                some: {
                  isPublic: true,
                },
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        notes: true,
      },
    });

    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: {
        categories,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar categorias de avaliacoes!",
      } as APIResponseInfo,
      data: {
        categories: [] as MapAssessmentComparisonCategory[],
      },
    };
  }
};

export const fetchMapAssessmentComparisonResultsParamsSchema = z.object({
  cityId: z.coerce.number(),
  categoryId: z.coerce.number(),
});

export type FetchMapAssessmentComparisonResultsParams = z.infer<
  typeof fetchMapAssessmentComparisonResultsParamsSchema
>;

export type FetchMapAssessmentComparisonResultsResponse = NonNullable<
  Awaited<ReturnType<typeof fetchMapAssessmentComparisonResults>>["data"]
>;

export const fetchMapAssessmentComparisonResults = async (
  request: APIRequestParams<FetchMapAssessmentComparisonResultsParams>,
) => {
  const { cityId, categoryId } = request.params!;
  try {
    const locations = await prisma.location.findMany({
      where: {
        cityId,
      },
      select: {
        id: true,
        name: true,
        popularName: true,
        isPublic: true,
        typeId: true,
        categoryId: true,
        mainImage: {
          select: {
            relativePath: true,
          },
        },
        type: {
          select: {
            name: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        broadAdministrativeUnitId: true,
        broadAdministrativeUnit: {
          select: {
            name: true,
          },
        },
        intermediateAdministrativeUnitId: true,
        intermediateAdministrativeUnit: {
          select: {
            name: true,
          },
        },
        narrowAdministrativeUnitId: true,
        narrowAdministrativeUnit: {
          select: {
            name: true,
          },
        },
        assessment: {
          where: {
            isPublic: true,
            form: {
              formItems: {
                some: {
                  categoryId,
                  questionId: {
                    not: null,
                  },
                  question: {
                    isPublic: true,
                  },
                },
              },
            },
          },
          orderBy: {
            startDate: "desc",
          },
          select: {
            id: true,
            startDate: true,
          },
        },
      },
    });
    const locationPolygons = await prisma.$queryRaw<
      Array<{ id: number; st_asgeojson: string | null }>
    >`
      SELECT
        l.id,
        CASE
          WHEN ST_IsEmpty(l.polygon) THEN NULL
          ELSE ST_AsGeoJSON(l.polygon)::text
        END AS st_asgeojson
      FROM location l
      WHERE l.city_id = ${cityId}
    `;
    const locationPolygonsById = new Map(
      locationPolygons.map((location) => [location.id, location.st_asgeojson]),
    );

    const formattedLocations: MapAssessmentComparisonLocation[] = locations.map(
      (location) => {
        const assessments = location.assessment.map((assessment) => ({
          id: assessment.id,
          startDate: assessment.startDate,
        }));

        return {
          id: location.id,
          name: location.name,
          popularName: location.popularName,
          st_asgeojson: locationPolygonsById.get(location.id) ?? null,
          mainImage: buildImageUrl(location.mainImage?.relativePath ?? null),
          isPublic: location.isPublic,
          typeId: location.typeId,
          typeName: location.type?.name ?? null,
          categoryId: location.categoryId,
          categoryName: location.category?.name ?? null,
          broadAdministrativeUnitId: location.broadAdministrativeUnitId,
          broadAdministrativeUnitName:
            location.broadAdministrativeUnit?.name ?? null,
          intermediateAdministrativeUnitId:
            location.intermediateAdministrativeUnitId,
          intermediateAdministrativeUnitName:
            location.intermediateAdministrativeUnit?.name ?? null,
          narrowAdministrativeUnitId: location.narrowAdministrativeUnitId,
          narrowAdministrativeUnitName:
            location.narrowAdministrativeUnit?.name ?? null,
          hasAssessmentsForSelectedCategory: assessments.length > 0,
          assessments,
        };
      },
    );

    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: {
        locations: sortMapAssessmentComparisonLocations(formattedLocations),
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar avaliacoes para comparacao!",
      } as APIResponseInfo,
      data: {
        locations: [] as MapAssessmentComparisonLocation[],
      },
    };
  }
};

export type MapAssessmentComparisonAssessmentTree = {
  id: number;
  startDate: Date;
  formSubmission: GetFormSubmissionDataResult;
};

export const fetchMapAssessmentComparisonAssessmentTreesParamsSchema = z.object(
  {
    categoryId: z.coerce.number(),
    locationIds: z
      .string()
      .transform((value) =>
        value.split(",").map((id) => z.coerce.number().parse(id)),
      ),
  },
);

export type FetchMapAssessmentComparisonAssessmentTreesParams = z.infer<
  typeof fetchMapAssessmentComparisonAssessmentTreesParamsSchema
>;

export type FetchMapAssessmentComparisonAssessmentTreesResponse = NonNullable<
  Awaited<
    ReturnType<typeof fetchMapAssessmentComparisonAssessmentTrees>
  >["data"]
>;

export const fetchMapAssessmentComparisonAssessmentTrees = async (
  request: APIRequestParams<FetchMapAssessmentComparisonAssessmentTreesParams>,
) => {
  const { categoryId, locationIds } = request.params!;
  try {
    const assessments = await prisma.assessment.findMany({
      where: {
        isPublic: true,
        locationId: {
          in: locationIds,
        },
        form: {
          formItems: {
            some: {
              categoryId,
            },
          },
        },
      },
      orderBy: [{ location: { name: "asc" } }, { startDate: "desc" }],
      select: {
        id: true,
        formSubmissionId: true,
        startDate: true,
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const locationsById = new Map<number, { id: number; name: string }>();
    const assessmentTreesByLocationId = new Map<
      number,
      MapAssessmentComparisonAssessmentTree[]
    >();

    const assessmentTrees = await Promise.all(
      assessments.map(async (assessment) => {
        const formSubmission = await getFormSubmissionData({
          formSubmissionId: assessment.formSubmissionId,
          includeCalculations: false,
          publicQuestionsOnly: true,
        });

        return {
          assessment,
          assessmentTree: {
            id: assessment.id,
            startDate: assessment.startDate,
            formSubmission: {
              ...formSubmission,
              formStructure: {
                ...formSubmission.formStructure,
                categories: formSubmission.formStructure.categories.filter(
                  (category) => category.categoryId === categoryId,
                ),
              },
            },
          } satisfies MapAssessmentComparisonAssessmentTree,
        };
      }),
    );

    assessmentTrees.forEach(({ assessment, assessmentTree }) => {
      locationsById.set(assessment.location.id, assessment.location);
      const locationAssessmentTrees =
        assessmentTreesByLocationId.get(assessment.location.id) ?? [];
      locationAssessmentTrees.push(assessmentTree);
      assessmentTreesByLocationId.set(
        assessment.location.id,
        locationAssessmentTrees,
      );
    });

    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: {
        locations: [...locationsById.values()].map((location) => ({
          id: location.id,
          name: location.name,
          assessmentTrees: assessmentTreesByLocationId.get(location.id) ?? [],
        })),
      },
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar resultados das avaliacoes!",
      } as APIResponseInfo,
      data: {
        locations: [] as {
          id: number;
          name: string;
          assessmentTrees: MapAssessmentComparisonAssessmentTree[];
        }[],
      },
    };
  }
};
