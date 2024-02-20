"use server";

import { Geometry, Position } from "geojson";
import { parseShp } from "shpjs";

const getPolygonFromShp = async (shpFile: File) => {
  if (shpFile.name.toLowerCase().endsWith(".shp")) {
    const arrayBuffer: ArrayBuffer = await shpFile.arrayBuffer();

    const geoJSON: Geometry[] = parseShp(arrayBuffer);
    const geometries = geoJSON.map((geometry: Geometry) => {
      if (geometry.type === "Polygon") {
        return `(${geometry.coordinates
          .map(
            (ring: Position[]) =>
              `(${ring.map((array: Position) => array.slice(0, 2).join(" ")).join(", ")})`,
          )
          .join(",")})`;
      }
    });

    const polygonsString: string = `MULTIPOLYGON (${geometries.join(", ")})`;

    return polygonsString;
  } else {
    return null;
  }
};

export { getPolygonFromShp };
