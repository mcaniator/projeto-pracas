"use server";

import { prisma } from "@/lib/prisma";
import { revalidateTag, unstable_cache } from "next/cache";

import { checkIfLoggedInUserHasAnyPermission } from "../serverOnly/checkPermission";

const fetchPolygons = async () => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["PARK"] });
  } catch (e) {
    return { statusCode: 401, polygons: [] };
  }
  try {
    const polygons = await prisma.$queryRaw<
      Array<{ st_asgeojson: string; id: number }>
    >`
          SELECT 
            id,
            ST_AsGeoJSON(polygon)::text as st_asgeojson
          FROM location 
          WHERE polygon IS NOT NULL;
        `;
    return { statusCode: 200, polygons };
  } catch (e) {
    return { statusCode: 500, polygons: [] };
  }
};

const fetchSpecificPolygon = async (id: number) => {
  //UNUSED
  await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["PARK"] });
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

const removePolygon = async (id: number) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["PARK_MANAGER"] });
  } catch (e) {
    return { statusCode: 401 };
  }
  if (!id) {
    return { statusCode: 500 };
  }
  try {
    await prisma.$executeRaw`
      UPDATE location
      SET 
        polygon = NULL,
        polygon_area = NULL
      WHERE id = ${id};
    `;
  } catch (e) {
    return { statusCode: 500 };
  }

  revalidateTag("location");

  return { statusCode: 200 };
};

export { fetchPolygons, fetchSpecificPolygon, removePolygon };
