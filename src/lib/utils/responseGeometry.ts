import type {
  ResponseFormGeometry,
  ResponseGeometry,
} from "@/lib/types/formSubmission/responseFormTypes";
import type { Coordinate } from "ol/coordinate";

const splitTopLevelWktItems = (value: string): string[] => {
  const items: string[] = [];
  let depth = 0;
  let itemStart = 0;

  for (let index = 0; index < value.length; index++) {
    const character = value[index];
    if (character === "(") {
      depth++;
    } else if (character === ")") {
      depth--;
      if (depth < 0) throw new Error("Invalid WKT parentheses.");
    } else if (character === "," && depth === 0) {
      items.push(value.slice(itemStart, index).trim());
      itemStart = index + 1;
    }
  }

  if (depth !== 0) throw new Error("Invalid WKT parentheses.");
  items.push(value.slice(itemStart).trim());
  return items.filter((item) => item.length > 0);
};

const parseCoordinate = (value: string): Coordinate => {
  const coordinate = value.trim().split(/\s+/).map(Number);
  if (coordinate.length < 2 || coordinate.some((number) => !isFinite(number))) {
    throw new Error(`Invalid WKT coordinate: ${value}`);
  }
  return coordinate;
};

const getWktParenthesesContent = (value: string): string => {
  const start = value.indexOf("(");
  if (start < 0 || !value.endsWith(")")) {
    throw new Error(`Invalid WKT geometry: ${value}`);
  }
  return value.slice(start + 1, -1).trim();
};

export const serializeResponseGeometryToWkt = (
  geometry: ResponseGeometry,
): string => {
  if (geometry.type === "Point") {
    const [longitude, latitude] = geometry.coordinates as Coordinate;
    return `POINT(${longitude} ${latitude})`;
  }

  if (geometry.type === "Polygon") {
    const ringsWkt = (geometry.coordinates as Coordinate[][])
      .map(
        (ring) =>
          `(${ring
            .map(([longitude, latitude]) => `${longitude} ${latitude}`)
            .join(",")})`,
      )
      .join(",");
    return `POLYGON(${ringsWkt})`;
  }

  throw new Error(`Unsupported response geometry type: ${geometry.type}`);
};

export const deserializeResponseGeometriesFromWkt = (
  wkt: string | null,
): ResponseGeometry[] => {
  if (!wkt) return [];

  const normalizedWkt = wkt.trim();
  if (/^GEOMETRYCOLLECTION\s+EMPTY$/i.test(normalizedWkt)) return [];
  const geometriesWkt =
    /^GEOMETRYCOLLECTION\s*\(/i.test(normalizedWkt) ?
      splitTopLevelWktItems(getWktParenthesesContent(normalizedWkt))
    : [normalizedWkt];

  return geometriesWkt.map((geometryWkt): ResponseGeometry => {
    if (/^POINT\s*\(/i.test(geometryWkt)) {
      return {
        type: "Point",
        coordinates: parseCoordinate(getWktParenthesesContent(geometryWkt)),
      };
    }

    if (/^POLYGON\s*\(/i.test(geometryWkt)) {
      const rings = splitTopLevelWktItems(
        getWktParenthesesContent(geometryWkt),
      ).map((ringWkt) => {
        const ring = getWktParenthesesContent(ringWkt);
        return splitTopLevelWktItems(ring).map(parseCoordinate);
      });
      return { type: "Polygon", coordinates: rings };
    }

    throw new Error(`Unsupported response geometry WKT: ${geometryWkt}`);
  });
};

export const groupResponseGeometriesByQuestion = (
  rows: readonly {
    id?: number;
    questionId: number;
    geometry: string | null;
    description: string | null;
  }[],
): ResponseFormGeometry[] => {
  const byQuestion = new Map<number, ResponseFormGeometry>();
  for (const { id, questionId, geometry, description } of rows) {
    let response = byQuestion.get(questionId);
    if (!response) {
      response = { questionId, geometries: [] };
      byQuestion.set(questionId, response);
    }
    const parsedGeometries = deserializeResponseGeometriesFromWkt(geometry);
    for (const parsedGeometry of parsedGeometries) {
      response.geometries.push({
        ...parsedGeometry,
        description,
        localId:
          id !== undefined && parsedGeometries.length === 1 ?
            String(id)
          : undefined,
      });
    }
  }
  return Array.from(byQuestion.values());
};
