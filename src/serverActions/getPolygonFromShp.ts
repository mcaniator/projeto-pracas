"use server";

import { parseShp } from "shpjs";

const getPolygonFromShp = async (formData: FormData) => {
  const file = formData.get("shpFile");
  const arrayBuffer: ArrayBuffer = await file.arrayBuffer();

  const geoJSON = parseShp(arrayBuffer);

  const polygons = geoJSON.map(
    (polygon) =>
      `(${polygon.coordinates
        .map(
          (ring: number[][]) =>
            `(${ring.map((array: number[]) => array.slice(0, -1).join(" ")).join(", ")})`,
        )
        .join(",")})`,
  );

  const polygonsString = `MULTIPOLYGON (${polygons.join(", ")})`;
  //console.log(polygonsString);
  //console.log(formData);
  return polygonsString;
};

export { getPolygonFromShp };
