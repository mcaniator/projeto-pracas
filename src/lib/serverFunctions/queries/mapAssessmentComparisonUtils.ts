export type MapAssessmentComparisonCategory = {
  id: number;
  name: string;
  notes: string | null;
};

export type MapAssessmentComparisonAssessment = {
  id: number;
  startDate: Date;
};

export type MapAssessmentComparisonLocation = {
  id: number;
  name: string;
  popularName: string | null;
  st_asgeojson: string | null;
  mainImage: string | null;
  isPublic: boolean;
  typeId: number | null;
  typeName: string | null;
  categoryId: number | null;
  categoryName: string | null;
  broadAdministrativeUnitId: number | null;
  broadAdministrativeUnitName: string | null;
  intermediateAdministrativeUnitId: number | null;
  intermediateAdministrativeUnitName: string | null;
  narrowAdministrativeUnitId: number | null;
  narrowAdministrativeUnitName: string | null;
  hasAssessmentsForSelectedCategory: boolean;
  assessments: MapAssessmentComparisonAssessment[];
};

export const sortMapAssessmentComparisonLocations = <
  T extends Pick<
    MapAssessmentComparisonLocation,
    "name" | "hasAssessmentsForSelectedCategory" | "assessments"
  >,
>(
  locations: T[],
): T[] => {
  return locations
    .map((location) => ({
      ...location,
      assessments: [...location.assessments].sort(
        (a, b) => b.startDate.getTime() - a.startDate.getTime(),
      ),
    }))
    .sort((a, b) => {
      if (
        a.hasAssessmentsForSelectedCategory !==
        b.hasAssessmentsForSelectedCategory
      ) {
        return a.hasAssessmentsForSelectedCategory ? -1 : 1;
      }

      return a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" });
    });
};
