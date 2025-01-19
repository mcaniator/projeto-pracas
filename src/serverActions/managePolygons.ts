"use server";

import { prisma } from "@/lib/prisma";
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
        console.error("Erro ao buscar polígonos:", error);
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
        console.error("Erro ao buscar polígono específico:", error);
        return null;
      }
    },
    ["fetchSpecificPolygon", id.toString()],
    { tags: ["location", "database"] },
  );

  return await cached();
};

const addPolygon = async (featuresGeoJson: string, id: number) => {
  try {
    if (!featuresGeoJson || !id) {
      throw new Error("featuresGeoJson e id são obrigatórios");
    }

    await prisma.$executeRaw`
      UPDATE location
      SET 
        polygon = ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON(${featuresGeoJson}), 4326)),
        polygon_area = ST_Area(ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON(${featuresGeoJson}), 4326), 3857))
      WHERE id = ${id};
    `;

    revalidateTag("location");
  } catch (error) {
    console.error("Erro ao adicionar polígono:", error);
    throw error;
  }
};

const addPolygonFromWKT = async (wkt: string, id: number) => {
  try {
    if (!wkt || !id) {
      throw new Error("WKT e id são obrigatórios");
    }

    await prisma.$executeRaw`
      UPDATE location
      SET 
        polygon = ST_Multi(ST_SetSRID(ST_GeomFromText(${wkt}), 4326)),
        polygon_area = ST_Area(ST_Transform(ST_SetSRID(ST_GeomFromText(${wkt}), 4326), 3857))
      WHERE id = ${id};
    `;

    revalidateTag("location");
  } catch (error) {
    console.error("Erro ao adicionar polígono from WKT:", error);
    throw error;
  }
};

const removePolygon = async (id: number) => {
  try {
    if (!id) {
      throw new Error("id é obrigatório");
    }

    await prisma.$executeRaw`
      UPDATE location
      SET 
        polygon = NULL,
        polygon_area = NULL
      WHERE id = ${id};
    `;

    revalidateTag("location");
  } catch (error) {
    console.error("Erro ao remover polígono:", error);
    throw error;
  }
};

export {
  fetchPolygons,
  fetchSpecificPolygon,
  addPolygon,
  removePolygon,
  addPolygonFromWKT,
};
