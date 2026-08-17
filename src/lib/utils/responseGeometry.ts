import type { ResponseGeometry } from "@/lib/types/assessments/geometry";
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

const serializeResponseGeometriesToWkt = (
  geometries: readonly ResponseGeometry[],
): string | null => {
  if (geometries.length === 0) return null;

  const geometriesWkt = geometries.map((geometry) => {
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
  });

  return `GEOMETRYCOLLECTION(${geometriesWkt.join(",")})`;
};

const deserializeResponseGeometriesFromWkt = (
  geometryCollectionWkt: string | null,
): ResponseGeometry[] => {
  if (!geometryCollectionWkt) return [];

  const normalizedWkt = geometryCollectionWkt.trim();
  if (/^GEOMETRYCOLLECTION\s+EMPTY$/i.test(normalizedWkt)) return [];
  if (!/^GEOMETRYCOLLECTION\s*\(/i.test(normalizedWkt)) {
    throw new Error("Expected a GEOMETRYCOLLECTION WKT value.");
  }

  const geometriesWkt = splitTopLevelWktItems(
    getWktParenthesesContent(normalizedWkt),
  );

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

export {
  deserializeResponseGeometriesFromWkt,
  serializeResponseGeometriesToWkt,
};
