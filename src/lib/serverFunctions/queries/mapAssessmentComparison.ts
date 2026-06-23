import type { FormValues } from "@/components/ui/responseForm/responseFormTypes";
import { fetchAssessmentsGeometries } from "@/lib/serverFunctions/serverOnly/geometries";
import type { ResponseGeometry } from "@/lib/types/assessments/geometry";
import type { Coordinate } from "ol/coordinate";

import { prisma } from "../../prisma";
import { APIResponseInfo } from "../../types/backendCalls/APIResponse";
import { FormItemUtils } from "../../utils/formTreeUtils";
import { buildImageUrl } from "../../utils/image";
import {
  AssessmentCategoryItem,
  AssessmentQuestionItem,
  AssessmentSubcategoryItem,
} from "./assessment";
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

export const fetchMapAssessmentComparisonCategories = async () => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        formItems: {
          some: {
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

export type FetchMapAssessmentComparisonResultsResponse = NonNullable<
  Awaited<ReturnType<typeof fetchMapAssessmentComparisonResults>>["data"]
>;

export const fetchMapAssessmentComparisonResults = async ({
  cityId,
  categoryId,
}: {
  cityId: number;
  categoryId: number;
}) => {
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
  categories: AssessmentCategoryItem[];
  responsesFormValues: FormValues;
  geometries: { questionId: number; geometries: ResponseGeometry[] }[];
};

const parseAssessmentGeometries = (
  geometry: string | null,
): ResponseGeometry[] => {
  if (!geometry) return [];

  const parsedGeometries: ResponseGeometry[] = [];
  const geometriesWithoutCollection = geometry
    .replace("GEOMETRYCOLLECTION(", "")
    .slice(0, -1);
  const geometriesWkt = geometriesWithoutCollection.match(
    /(?:POINT|POLYGON)\([^)]*\)+/g,
  );

  geometriesWkt?.forEach((geometryWkt) => {
    if (geometryWkt.startsWith("POINT")) {
      parsedGeometries.push({
        type: "Point",
        coordinates: geometryWkt
          .replace("POINT(", "")
          .replace(")", "")
          .split(" ")
          .map(Number),
      });
      return;
    }

    const rings: Coordinate[][] = geometryWkt
      .replace("POLYGON(", " ")
      .slice(0, -1)
      .split("),(")
      .map((ring) =>
        ring
          .split(",")
          .map((point) =>
            point
              .replace("(", "")
              .replace(")", "")
              .trim()
              .split(" ")
              .map(Number),
          ),
      );
    parsedGeometries.push({ type: "Polygon", coordinates: rings });
  });

  return parsedGeometries;
};

export type FetchMapAssessmentComparisonAssessmentTreesResponse = NonNullable<
  Awaited<
    ReturnType<typeof fetchMapAssessmentComparisonAssessmentTrees>
  >["data"]
>;

type MapAssessmentComparisonAssessmentQueryResult = {
  id: number;
  startDate: Date;
  location: { id: number; name: string };
  form: {
    calculations: { expression: string; targetQuestionId: number }[];
    formItems: {
      id: number;
      position: number;
      categoryId: number;
      subcategoryId: number | null;
      questionId: number | null;
      category: {
        id: number;
        name: string;
        notes: string | null;
      };
      subcategory: {
        id: number;
        name: string;
        notes: string | null;
        categoryId: number;
      } | null;
      question: {
        id: number;
        name: string;
        iconKey: string;
        isPublic: boolean;
        scaleConfig: { minValue: number; maxValue: number } | null;
        notes: string | null;
        questionType: AssessmentQuestionItem["questionType"];
        characterType: AssessmentQuestionItem["characterType"];
        optionType: AssessmentQuestionItem["optionType"];
        options: { id: number; text: string; isOverridable: boolean }[];
        categoryId: number;
        subcategoryId: number | null;
        geometryTypes: AssessmentQuestionItem["geometryTypes"];
        allowResponseImages: boolean;
        response: {
          assessmentId: number;
          response: string | null;
        }[];
        booleanResponses: {
          assessmentId: number;
          checked: boolean;
        }[];
        ResponseOption: {
          assessmentId: number;
          overrideValue: string | null;
          option: { id: number } | null;
        }[];
      } | null;
    }[];
  };
};

export const fetchMapAssessmentComparisonAssessmentTrees = async ({
  categoryId,
  locationIds,
}: {
  categoryId: number;
  locationIds: number[];
}) => {
  try {
    const assessmentIds = (
      await prisma.assessment.findMany({
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
        select: { id: true },
      })
    ).map((assessment) => assessment.id);

    const assessments = await prisma.assessment.findMany({
      where: {
        id: {
          in: assessmentIds,
        },
      },
      orderBy: [{ location: { name: "asc" } }, { startDate: "desc" }],
      select: {
        id: true,
        startDate: true,
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        form: {
          select: {
            calculations: {
              select: {
                expression: true,
                targetQuestionId: true,
              },
            },
            formItems: {
              where: {
                categoryId,
                OR: [{ questionId: null }, { question: { isPublic: true } }],
              },
              orderBy: {
                position: "asc",
              },
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                    notes: true,
                  },
                },
                subcategory: {
                  select: {
                    id: true,
                    name: true,
                    notes: true,
                    categoryId: true,
                  },
                },
                question: {
                  where: {
                    isPublic: true,
                  },
                  select: {
                    id: true,
                    name: true,
                    iconKey: true,
                    isPublic: true,
                    scaleConfig: true,
                    notes: true,
                    questionType: true,
                    characterType: true,
                    optionType: true,
                    options: {
                      select: {
                        text: true,
                        id: true,
                        isOverridable: true,
                      },
                    },
                    categoryId: true,
                    subcategoryId: true,
                    geometryTypes: true,
                    allowResponseImages: true,
                    response: {
                      where: {
                        assessmentId: { in: assessmentIds },
                      },
                      select: {
                        assessmentId: true,
                        response: true,
                      },
                    },
                    booleanResponses: {
                      where: {
                        assessmentId: { in: assessmentIds },
                      },
                      select: {
                        assessmentId: true,
                        checked: true,
                      },
                    },
                    ResponseOption: {
                      where: {
                        assessmentId: { in: assessmentIds },
                        optionId: { not: null },
                      },
                      select: {
                        assessmentId: true,
                        overrideValue: true,
                        option: {
                          select: {
                            id: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const locationsById = new Map<number, { id: number; name: string }>();
    const rawGeometries = (
      await fetchAssessmentsGeometries(assessmentIds)
    ).flat();
    const geometriesByAssessmentId = new Map<
      number,
      { questionId: number; geometries: ResponseGeometry[] }[]
    >();
    rawGeometries.forEach((geometry) => {
      const assessmentGeometries =
        geometriesByAssessmentId.get(geometry.assessmentId) ?? [];
      assessmentGeometries.push({
        questionId: geometry.questionId,
        geometries: parseAssessmentGeometries(geometry.geometry),
      });
      geometriesByAssessmentId.set(geometry.assessmentId, assessmentGeometries);
    });
    const assessmentTreesByLocationId = new Map<
      number,
      MapAssessmentComparisonAssessmentTree[]
    >();

    assessments.forEach((assessment) => {
      locationsById.set(assessment.location.id, assessment.location);
      const assessmentTree = buildMapAssessmentComparisonAssessmentTree({
        assessment,
        geometries: geometriesByAssessmentId.get(assessment.id) ?? [],
      });
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
  } catch (e) {
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

const buildMapAssessmentComparisonAssessmentTree = ({
  assessment,
  geometries,
}: {
  assessment: MapAssessmentComparisonAssessmentQueryResult;
  geometries: { questionId: number; geometries: ResponseGeometry[] }[];
}): MapAssessmentComparisonAssessmentTree => {
  const categories: AssessmentCategoryItem[] = [];
  const responsesFormValues: FormValues = {};

  const sortedFormItems = assessment.form.formItems.sort((a, b) => {
    const rankDiff =
      FormItemUtils.getItemRankForSorting(a) -
      FormItemUtils.getItemRankForSorting(b);
    if (rankDiff !== 0) return rankDiff;

    return a.position - b.position;
  });

  for (const item of sortedFormItems) {
    if (FormItemUtils.isCategoryType(item)) {
      if (!categories.find((c) => c.categoryId === item.categoryId)) {
        categories.push({
          id: item.id,
          categoryId: item.categoryId,
          name: item.category.name,
          notes: item.category.notes,
          position: item.position,
          categoryChildren: [],
        });
      }
      continue;
    }

    if (FormItemUtils.isSubcategoryType(item)) {
      const dbSubcategory = item.subcategory;
      if (!dbSubcategory) {
        throw new Error("Subcategory form item without subcategory data");
      }
      const category = categories.find(
        (c) => c.categoryId === dbSubcategory.categoryId,
      );
      if (!category) {
        throw new Error("Subcategory's category not found");
      }

      let subcategory = category.categoryChildren.find(
        (c): c is AssessmentSubcategoryItem =>
          FormItemUtils.isSubcategoryType(c) &&
          c.subcategoryId === item.subcategoryId,
      );

      if (!subcategory) {
        subcategory = {
          id: item.id,
          position: item.position,
          subcategoryId: item.subcategoryId,
          name: dbSubcategory.name,
          notes: dbSubcategory.notes,
          questions: [],
        };
        category.categoryChildren.push(subcategory);
      }
      continue;
    }

    if (FormItemUtils.isQuestionType(item)) {
      const dbQuestion = item.question;
      if (!dbQuestion) continue;

      if (dbQuestion.questionType === "WRITTEN") {
        const response = dbQuestion.response.find(
          (response) => response.assessmentId === assessment.id,
        )?.response;
        if (
          dbQuestion.characterType === "NUMBER" ||
          dbQuestion.characterType === "PERCENTAGE" ||
          dbQuestion.characterType === "SCALE"
        ) {
          responsesFormValues[dbQuestion.id] =
            response ? Number(response) : null;
        } else {
          responsesFormValues[dbQuestion.id] = response ?? null;
        }
      } else if (dbQuestion.questionType === "OPTIONS") {
        const optionResponses = dbQuestion.ResponseOption.filter(
          (response) => response.assessmentId === assessment.id,
        );
        if (dbQuestion.optionType === "RADIO") {
          const response = optionResponses[0];
          responsesFormValues[dbQuestion.id] =
            response?.option?.id ?
              {
                value: response.option.id,
                override: response.overrideValue,
              }
            : null;
        } else if (dbQuestion.optionType === "CHECKBOX") {
          responsesFormValues[dbQuestion.id] = optionResponses.map(
            (response) => ({
              value: response.option!.id,
              override: response.overrideValue,
            }),
          );
        }
      } else if (dbQuestion.questionType === "BOOLEAN") {
        responsesFormValues[dbQuestion.id] =
          dbQuestion.booleanResponses.find(
            (response) => response.assessmentId === assessment.id,
          )?.checked ?? false;
      }

      const relatedCalculation = assessment.form.calculations.find(
        (calc) => calc.targetQuestionId === item.questionId,
      );
      const question: AssessmentQuestionItem = {
        id: item.id,
        position: item.position,
        questionId: item.questionId,
        name: dbQuestion.name,
        iconKey: dbQuestion.iconKey,
        isPublic: dbQuestion.isPublic,
        allowResponseImages: dbQuestion.allowResponseImages,
        scaleConfig: dbQuestion.scaleConfig,
        notes: dbQuestion.notes,
        questionType: dbQuestion.questionType,
        characterType: dbQuestion.characterType,
        optionType: dbQuestion.optionType,
        options: dbQuestion.options,
        geometryTypes: dbQuestion.geometryTypes,
        calculationExpression: relatedCalculation?.expression,
        categoryName: "placeholder",
        subcategoryName: null,
      };

      const category = categories.find(
        (c) => c.categoryId === dbQuestion.categoryId,
      );
      if (!category) {
        throw new Error("Question's category not found");
      }
      question.categoryName = category.name;
      if (dbQuestion.subcategoryId) {
        const subcategory = category.categoryChildren.find(
          (c): c is AssessmentSubcategoryItem =>
            FormItemUtils.isSubcategoryType(c) &&
            c.subcategoryId === dbQuestion.subcategoryId,
        );
        if (subcategory) {
          question.subcategoryName = subcategory.name;
          subcategory.questions.push(question);
        }
      } else {
        category.categoryChildren.push(question);
      }
    }
  }

  categories.sort((a, b) => a.position - b.position);
  categories.forEach((category) => {
    category.categoryChildren.sort((a, b) => a.position - b.position);
    category.categoryChildren.forEach((child) => {
      if (FormItemUtils.isSubcategoryType(child)) {
        child.questions.sort((a, b) => a.position - b.position);
      }
    });
  });

  return {
    id: assessment.id,
    startDate: assessment.startDate,
    categories,
    responsesFormValues,
    geometries,
  };
};
