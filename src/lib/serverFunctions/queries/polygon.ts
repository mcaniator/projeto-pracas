import {
  LocationWithPolygon,
  LocationsWithPolygonResponse,
} from "@customTypes/location/location";
import { prisma } from "@lib/prisma";
import { unstable_cache } from "next/cache";

const fetchPolygons = async () => {
  //UNUSED
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

const fetchLocationsWithPolygon =
  async (): Promise<LocationsWithPolygonResponse> => {
    try {
      const locations = await prisma.$queryRaw<Array<LocationWithPolygon>>`
          SELECT 
            id,
            name,
            ST_AsGeoJSON(polygon)::text as st_asgeojson
          FROM location 
        `;
      return { statusCode: 200, locations };
    } catch (e) {
      return { statusCode: 500, locations: [] };
    }
  };

const fetchSpecificPolygon = async (id: number) => {
  //UNUSED
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

export { fetchPolygons, fetchSpecificPolygon, fetchLocationsWithPolygon };
