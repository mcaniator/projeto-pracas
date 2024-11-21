"use server";

import { prisma } from "@/lib/prisma";
import { revalidateTag, unstable_cache } from "next/cache";

const fetchPolygons = async () => {
  const cached = unstable_cache(
    async () => {
      let polygons = await prisma.$queryRaw<
        { st_asgeojson: string; id: number }[]
      >`
      SELECT st_asgeojson(polygon), id
      FROM location;
      `;

      polygons = polygons.filter((polygon) => polygon.st_asgeojson !== null);

      return polygons;
    },
    ["fetchsPolygons"],
    { tags: ["location", "database"] },
  );

  return await cached();
};

const fetchSpecificPolygon = async (id: number) => {
  const cached = unstable_cache(
    async () => {
      const polygon = await prisma.$queryRaw<
        {
          st_asgeojson: string;
          id: number;
        }[]
      >`
        SELECT st_asgeojson(polygon), id
        FROM location
        WHERE id = ${id}`;

      if (polygon.length === 1) return polygon;
      else return null;
    },

    ["fetchsSpecificPolygon"],
    { tags: ["location", "database"] },
  );

  return await cached();
};

const addPolygon = async (featuresGeoJson: string, id: number) => {
  await prisma.$executeRaw`
    UPDATE location
    SET polygon = st_geomfromgeojson(${featuresGeoJson})
    WHERE id = ${id};`;

  revalidateTag("location");
};

const addPolygonFromWKT = async (wkt: string, id: number) => {
  await prisma.$executeRaw`
    UPDATE location
    SET polygon = ST_GeomFromText(${wkt}, 4326)
    WHERE id = ${id};`;

  revalidateTag("location");
};

const removePolygon = async (id: number) => {
  await prisma.$executeRaw`
    UPDATE location
    SET polygon = null
    WHERE id = ${id}`;

  revalidateTag("location");
};

export {
  fetchPolygons,
  fetchSpecificPolygon,
  addPolygon,
  removePolygon,
  addPolygonFromWKT,
};
