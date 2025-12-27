import Feature from "ol/Feature";
import { Geometry, MultiPolygon, Polygon } from "ol/geom";

export const checkIfValidLocationFeature = (feature: Feature<Geometry>) => {
  const geometry = feature.getGeometry();
  if (
    !geometry ||
    (geometry instanceof Polygon &&
      (!geometry.getCoordinates() || geometry.getCoordinates().length === 0)) ||
    (geometry instanceof MultiPolygon &&
      (!geometry.getCoordinates() || geometry.getCoordinates().length === 0))
  ) {
    return false;
  }
  return true;
};
