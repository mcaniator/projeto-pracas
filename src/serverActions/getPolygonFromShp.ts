"use server";

import { parseShp } from "shpjs";

const getPolygonFromShp = async (formData: FormData) => {
  const file = formData.get("shpFile");
  const arrayBuffer = await file.arrayBuffer();
  const geoJSON = parseShp(arrayBuffer);

  const polygons = geoJSON.map(
    (polygon) =>
      `(${polygon.coordinates
        .map((ring) => `(${ring.map((array) => array.join(" ")).join(", ")})`)
        .join(",")})`,
  );

  const polygonsString = `MULTIPOLYGON (${polygons.join(", ")})`;
  console.log(polygonsString);
};

export { getPolygonFromShp };
