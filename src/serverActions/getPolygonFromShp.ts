"use server";

import { Geometry, Position } from "geojson";
import { parseShp } from "shpjs";

const getPolygonFromShp = async (shpFile: File) => {
  if (shpFile.name.toLowerCase().endsWith(".shp")) {
    const arrayBuffer: ArrayBuffer = await shpFile.arrayBuffer();

    const geometryArray: Geometry[] = parseShp(arrayBuffer);
    const geometries = geometryArray.map((geometry: Geometry) => {
      if (geometry.type === "Polygon") {
        return `(${geometry.coordinates
          .map(
            (ring: Position[]) =>
              `(${ring.map((array: Position) => array.slice(0, 2).join(" ")).join(", ")})`,
          )
          .join(",")})`;
      } else if (geometry.type === "MultiPolygon") {
        return geometry.coordinates.map((multipolygon: Position[][]) => {
          const polygons = multipolygon.map(
            (ring: Position[]) =>
              `(${ring.map((array: Position) => array.slice(0, 2).join(" ")).join(", ")})`,
          );
          return `(${polygons.join(", ")})`;
        });
      }
    });

    const polygonsString: string = `MULTIPOLYGON (${geometries.join(", ")})`;
    return polygonsString;
  } else {
    return null;
  }
};

export { getPolygonFromShp };
