import { Coordinate } from "ol/coordinate";
import { Type } from "ol/geom/Geometry";

type ResponseGeometryType = "POINT" | "POLYGON" | "POINT_AND_POLYGON";

type ResponseGeometry = {
  type: Type;
  coordinates: Coordinate | Coordinate[][];
};

export { type ResponseGeometry, type ResponseGeometryType };
