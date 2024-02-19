"use server";

import { coordinatesArrayType } from "@/lib/zodValidators";
import { coordinatesRingType } from "@/lib/zodValidators";
import { coordinatesPolygonType } from "@/lib/zodValidators";
import { geoJSONFromShpType } from "@/lib/zodValidators";
import { parseShp } from "shpjs";

const getPolygonFromShp = async (formData: FormData) => {
  const file = formData.get("shpFile");
  if (true) {
    const arrayBuffer: ArrayBuffer = await file.arrayBuffer();

    const geoJSON: geoJSONFromShpType = parseShp(arrayBuffer);
    console.log(geoJSON);
    const polygons = geoJSON.map(
      (polygon: coordinatesPolygonType) =>
        `(${polygon.coordinates
          .map(
            (ring: coordinatesRingType) =>
              `(${ring.map((array: coordinatesArrayType) => array.slice(0, 2).join(" ")).join(", ")})`,
          )
          .join(",")})`,
    );

    const polygonsString: string = `MULTIPOLYGON (${polygons.join(", ")})`;

    return polygonsString;
  } else {
    return "";
  }
};

export { getPolygonFromShp };
