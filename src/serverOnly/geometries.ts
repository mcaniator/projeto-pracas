import "server-only";

import { prisma } from "../lib/prisma";

type FetchedAssessmentGeometries = NonNullable<
  Awaited<ReturnType<typeof fetchAssessmentGeometries>>
>;

const fetchAssessmentGeometries = async (assessmentId: number) => {
  const geometries = await prisma.$queryRaw<
    { assessmentId: number; questionId: number; geometry: string | null }[]
  >`
    SELECT assessment_id as "assessmentId", question_id as "questionId", ST_AsText(geometry) as geometry
    FROM question_geometry
    WHERE assessment_id = ${assessmentId}
  `;

  return geometries;
};

const fetchAssessmentsGeometries = async (assessmentsIds: number[]) => {
  const geometries = await Promise.all(
    assessmentsIds.flatMap((a) => fetchAssessmentGeometries(a)),
  );
  return geometries;
};

export { fetchAssessmentGeometries, fetchAssessmentsGeometries };
export type { FetchedAssessmentGeometries };
