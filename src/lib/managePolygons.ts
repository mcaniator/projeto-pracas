"use server";

import { prisma } from "@/lib/prisma";

// Prisma não apresenta suporte nativo para tipos geométricos, portanto é usada uma raw query para buscar os dados
const fetchPolygons = async () => {
  const polygons: { id: number; type: string; coordinates: [number, number][][] }[] = await prisma.$queryRaw<
    { st_asgeojson: string; id: number }[]
  >`SELECT ST_AsGeoJSON(poligono), id FROM local`.then((result) =>
    result.map((value) => {
      return { id: value.id, ...JSON.parse(value.st_asgeojson) };
    }),
  );

  return polygons;
};

const fetchSpecificPolygon = async (localId: number) => {
  const polygons: { id: number; type: string; coordinates: [number, number][][] } = await prisma.$queryRaw<
    {
      st_asgeojson: string;
      id: number;
    }[]
  >`SELECT ST_AsGeoJSON(poligono), id FROM local WHERE id = ${localId}`.then((result) => {
    return result.map((value) => {
      return { id: value.id, ...JSON.parse(value.st_asgeojson) };
    })[0];
  });

  return polygons;
};

const polygonObjectToString = (polygons: { id: number; type: string; coordinates: [number, number][][] }) => {
  const coordinates = polygons.coordinates;
  const text = coordinates.map((value) => {
    return value
      .map((numbers) => {
        return numbers.join(" ");
      })
      .join(", ");
  });
  const joined = `(${text.join("), (")})`;

  return `POLYGON(${joined})`;
};

const addPolygons = async (polygons: { id: number; type: string; coordinates: [number, number][][] }) => {
  const isNull = (await fetchSpecificPolygon(polygons.id)).coordinates == null;

  if (isNull) {
    const geometry = polygonObjectToString(polygons);
    await prisma.$executeRaw`UPDATE local SET poligono = st_geomfromtext(${geometry}, 4326) WHERE id = ${polygons.id}`;
  } else {
    throw new Error("Square already has a registered polygon");
  }
};

// Separado em outra função para garantir que não estaremos editando polígonos já existentes acidentalmente
const editPolygons = async (polygons: { id: number; type: string; coordinates: [number, number][][] }) => {
  const geometry = polygonObjectToString(polygons);
  await prisma.$executeRaw`UPDATE local SET poligono = st_geomfromtext(${geometry}, 4326) WHERE id = ${polygons.id}`;
};

export { fetchPolygons, fetchSpecificPolygon, addPolygons, editPolygons };
