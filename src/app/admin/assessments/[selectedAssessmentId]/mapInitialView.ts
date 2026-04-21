import { ResponseGeometry } from "@/lib/types/assessments/geometry";
import { Extent, buffer, createEmpty, extend, isEmpty } from "ol/extent";
import GeoJSON from "ol/format/GeoJSON";
import { Point, Polygon } from "ol/geom";

const SINGLE_POINT_BUFFER_DEGREES = 0.0005;

export type InitialViewTarget =
  | {
      type: "location-polygon";
      extent: Extent;
    }
  | {
      type: "response-geometries";
      extent: Extent;
    }
  | {
      type: "geolocation";
    };

const getLocationPolygonExtent = (
  locationPolygonGeoJson: string | null | undefined,
): Extent | null => {
  if (!locationPolygonGeoJson) return null;

  const geometry = new GeoJSON().readGeometry(locationPolygonGeoJson);
  if (!geometry) return null;

  return geometry.getExtent();
};

const getResponseGeometriesExtent = (
  initialGeometries: ResponseGeometry[] | undefined,
): Extent | null => {
  if (!initialGeometries || initialGeometries.length === 0) return null;

  const extent = createEmpty();

  initialGeometries.forEach((geometry) => {
    if (geometry.type === "Point") {
      const point = new Point(geometry.coordinates as number[]);
      extend(extent, point.getExtent());
      return;
    }

    if (geometry.type === "Polygon") {
      const polygon = new Polygon(geometry.coordinates as number[][][]);
      extend(extent, polygon.getExtent());
    }
  });

  if (isEmpty(extent)) return null;

  const [minX, minY, maxX, maxY] = extent;
  const isSinglePointExtent = minX === maxX && minY === maxY;

  return isSinglePointExtent ?
      buffer(extent, SINGLE_POINT_BUFFER_DEGREES)
    : extent;
};

export const resolveInitialViewTarget = ({
  locationPolygonGeoJson,
  initialGeometries,
}: {
  locationPolygonGeoJson: string | null | undefined;
  initialGeometries: ResponseGeometry[] | undefined;
}): InitialViewTarget => {
  const responseGeometriesExtent = getResponseGeometriesExtent(initialGeometries);
  if (responseGeometriesExtent) {
    return {
      type: "response-geometries",
      extent: responseGeometriesExtent,
    };
  }

  const locationPolygonExtent = getLocationPolygonExtent(locationPolygonGeoJson);
  if (locationPolygonExtent) {
    return {
      type: "location-polygon",
      extent: locationPolygonExtent,
    };
  }

  return {
    type: "geolocation",
  };
};
