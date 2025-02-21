"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidateTag, unstable_cache } from "next/cache";

const fetchPolygons = async () => {
  const cached = unstable_cache(
    async () => {
      try {
        const result = await prisma.$queryRaw<
          Array<{ st_asgeojson: string; id: number }>
        >`
          SELECT 
            id,
            ST_AsGeoJSON(polygon)::text as st_asgeojson
          FROM location 
          WHERE polygon IS NOT NULL;
        `;

        return Array.isArray(result) ? result : [];
      } catch (error) {
        return [];
      }
    },
    ["fetchPolygons"],
    { tags: ["location", "database"] },
  );

  return await cached();
};

const fetchSpecificPolygon = async (id: number) => {
  const cached = unstable_cache(
    async () => {
      try {
        if (!id) return null;

        const result = await prisma.$queryRaw<
          Array<{ st_asgeojson: string; id: number }>
        >`
          SELECT 
            id,
            ST_AsGeoJSON(polygon)::text as st_asgeojson
          FROM location 
          WHERE id = ${id} AND polygon IS NOT NULL;
        `;

        return Array.isArray(result) && result.length > 0 ? result : null;
      } catch (error) {
        return null;
      }
    },
    ["fetchSpecificPolygon", id.toString()],
    { tags: ["location", "database"] },
  );

  return await cached();
};

const addPolygon = async (
  featuresGeoJson: string,
  id: number,
  tx?: Prisma.TransactionClient,
) => {
  if (!featuresGeoJson || !id) {
    throw new Error("featuresGeoJson and id are mandatory");
  }
  const transaction = tx ?? prisma;
  try {
    await transaction.$executeRaw`
      UPDATE location
      SET 
        polygon = ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON(${featuresGeoJson}), 4326)),
        polygon_area = ST_Area(ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON(${featuresGeoJson}), 4326), 3857))
      WHERE id = ${id};
    `;
  } catch (e) {
    throw new Error();
  }
};

const addPolygonFromWKT = async (
  wkt: string,
  id: number,
  prisma: Prisma.TransactionClient,
) => {
  if (!wkt || !id) {
    throw new Error("WKT and id are mandatory");
  }
  try {
    await prisma.$executeRaw`
      UPDATE location
      SET 
        polygon = ST_Multi(ST_SetSRID(ST_GeomFromText(${wkt}), 4326)),
        polygon_area = ST_Area(ST_Transform(ST_SetSRID(ST_GeomFromText(${wkt}), 4326), 3857))
      WHERE id = ${id};
    `;
  } catch (e) {
    throw new Error();
  }
};

const removePolygon = async (id: number) => {
  if (!id) {
    throw new Error("id is mandatory");
  }

  await prisma.$executeRaw`
      UPDATE location
      SET 
        polygon = NULL,
        polygon_area = NULL
      WHERE id = ${id};
    `;

  revalidateTag("location");
};

const hasPolygon = async (id: number) => {
  try {
    const result: { id: number; haspolygon: boolean }[] =
      await prisma.$queryRaw`
  SELECT id, polygon IS NOT NULL AS hasPolygon FROM location WHERE id = ${id}
`;
    return result[0]?.haspolygon;
  } catch (e) {
    throw new Error("Error checking if location has polygon");
  }
};

export {
  fetchPolygons,
  fetchSpecificPolygon,
  addPolygon,
  removePolygon,
  addPolygonFromWKT,
  hasPolygon,
};
