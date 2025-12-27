import { featuresGeoJsonSchema } from "@/lib/zodValidators";
import { Prisma } from "@prisma/client";
import { MultiPolygon, Polygon } from "geojson";
import "server-only";
import { parseShp } from "shpjs";

import { prisma } from "../../prisma";

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

const mapPolygon = (coordinates: number[][][]) => {
  // Polygon and Holes Array eg.: [(), (), (), ()]
  const polygonsArray = coordinates.map((ring) => {
    // X and Y coordinate pair array
    const coordinatesPairArray = ring.map((array) => `${array[0]} ${array[1]}`);

    // Connects X and Y coordinate pairs with commas eg.: 5 4, 1 3, 6, 7
    const polygonCoordinates = coordinatesPairArray.join(", ");

    return `(${polygonCoordinates})`;
  });

  // Connects polygon and holes into a comma seperated string eg.: (), (), (), ()
  const polygonString = polygonsArray.join(", ");

  return `(${polygonString})`;
};

const getPolygonsFromShp = async (shpFile: File) => {
  if (!shpFile.name.toLowerCase().endsWith(".shp")) return null;

  const geometryArray = parseShp(await shpFile.arrayBuffer());

  let multiPolygonAmount = 0;
  let polygonAmount = 0;

  const validGeometricalTypes = geometryArray.filter((geometry) => {
    const isPolygon = geometry.type === "Polygon";
    const isMultiPolygon = geometry.type === "MultiPolygon";

    if (isPolygon) polygonAmount++;
    else if (isMultiPolygon) multiPolygonAmount++;

    return isPolygon || isMultiPolygon;
  });

  // TODO ask if these are actual issues that should be accounted for
  if (
    validGeometricalTypes.length === 0 ||
    multiPolygonAmount > 1 || // Shapefiles with more than one multiPolygon are very likely user error containing more than one park polygon in a single file
    (polygonAmount !== 0 && multiPolygonAmount !== 0) // Shapefiles with a mix of types are also very likely to be user error
  )
    return null;

  let polygonArray;
  if (polygonAmount !== 0) {
    // Gets each individual polygon from the polygon array and maps it to a string
    polygonArray = (validGeometricalTypes as Polygon[]).map((geometry) => {
      const polygon = mapPolygon(geometry.coordinates);

      return polygon;
    });
  } else {
    // Since we only accept multiPolygon files if they contain exactly 1 multiPolygon I can get the first index of an array and assert that it isn't undefined
    const multiPolygon = (validGeometricalTypes as MultiPolygon[])[0]!;
    // MultiPolygons contain the equivalent of more than one polygon in their coordinates array so we map them to parse each individually as if they were separate polygons
    polygonArray = multiPolygon.coordinates.map(mapPolygon);
  }

  const multiPolygonJoined = polygonArray.join(", ");
  const multiPolygonString = `MULTIPOLYGON(${multiPolygonJoined})`;

  return multiPolygonString;
};

const addPolygonFromWKT = async (
  wkt: string,
  id: number,
  prisma: Prisma.TransactionClient,
) => {
  if (!wkt || !id) {
    throw new Error("WKT and id are mandatory");
  }
  try {
    await prisma.$executeRaw`
      UPDATE location
      SET 
        polygon = ST_Multi(ST_SetSRID(ST_GeomFromText(${wkt}), 4326)),
        polygon_area = ST_Area(ST_Transform(ST_SetSRID(ST_GeomFromText(${wkt}), 4326), 3857))
      WHERE id = ${id};
    `;
  } catch (e) {
    throw new Error();
  }
};

const addPolygon = async (
  featuresGeoJson: string,
  id: number,
  tx?: Prisma.TransactionClient,
) => {
  if (!featuresGeoJson || !id) {
    throw new Error("featuresGeoJson and id are mandatory");
  }

  const parsed = featuresGeoJsonSchema.safeParse(featuresGeoJson);
  if (!parsed.success) {
    return;
  }
  if (parsed.data.coordinates.length === 0) {
    return;
  }

  const transaction = tx ?? prisma;
  try {
    await transaction.$executeRaw`
      UPDATE location
      SET 
        polygon = ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON(${featuresGeoJson}), 4326)),
        polygon_area = ST_Area(ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON(${featuresGeoJson}), 4326), 3857))
      WHERE id = ${id};
    `;
  } catch (e) {
    throw new Error();
  }
};

const hasPolygon = async (id: number) => {
  try {
    const result: { id: number; haspolygon: boolean }[] =
      await prisma.$queryRaw`
  SELECT id, polygon IS NOT NULL AS hasPolygon FROM location WHERE id = ${id}
`;
    return result[0]?.haspolygon;
  } catch (e) {
    throw new Error("Error checking if location has polygon");
  }
};

export {
  fetchAssessmentGeometries,
  fetchAssessmentsGeometries,
  getPolygonsFromShp,
  addPolygonFromWKT,
  addPolygon,
  hasPolygon,
};
export type { FetchedAssessmentGeometries };
