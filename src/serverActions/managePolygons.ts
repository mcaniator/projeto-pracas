"use server";

import { prisma } from "@/lib/prisma";

// TODO configurar casos onde não existem registros na base de dados

// Prisma não apresenta suporte nativo para tipos geométricos, portanto é usada uma raw query para buscar os dados
const fetchPolygons = async () => {
  const polygons: { id: number; type: string; coordinates: [number, number][][] }[] = await prisma.$queryRaw<
    { st_asgeojson: string; id: number }[]
  >`SELECT ST_AsGeoJSON(poligono), id FROM local`.then((result) =>
    result.map((value) => ({ id: value.id, ...(JSON.parse(value.st_asgeojson) as { type: string; coordinates: [number, number][][] }) })),
  );

  return polygons;
};

const fetchSpecificPolygon = async (localId: number) => {
  const polygons: { id: number; type: string; coordinates: [number, number][][] } | undefined = await prisma.$queryRaw<
    {
      st_asgeojson: string;
      id: number;
    }[]
  >`SELECT ST_AsGeoJSON(poligono), id FROM local WHERE id = ${localId}`.then(
    (result) =>
      result.map((value) => ({
        id: value.id,
        ...(JSON.parse(value.st_asgeojson) as { type: string; coordinates: [number, number][][] }),
      }))[0],
  );

  return polygons;
};

// ! This function only works with MultiPolygon types
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

  return `${polygons.type}(${joined})`;
};

const addPolygons = async (polygons: { id: number; type: string; coordinates: [number, number][][] }) => {
  // TODO com certeza tem um jeito melhor de fazer isso, mas eu preciso de alguém melhor em SQL para resolver
  const aux = await fetchSpecificPolygon(polygons.id);
  const isNull = aux == undefined || aux.coordinates == null;

  if (isNull) {
    const geometry = polygonObjectToString(polygons);
    await prisma.$executeRaw`UPDATE location SET polygon = st_geomfromtext(${geometry}, 4326) WHERE id = ${polygons.id}`;
  } else {
    throw new Error("Square already has a registered polygon");
  }
};

// Separado em outra função para garantir que não estaremos editando polígonos já existentes acidentalmente
const editPolygons = async (polygons: { id: number; type: string; coordinates: [number, number][][] }) => {
  const geometry = polygonObjectToString(polygons);
  await prisma.$executeRaw`UPDATE local SET poligono = st_geomfromtext(${geometry}, 4326) WHERE id = ${polygons.id}`;
};

export { addPolygons, editPolygons, fetchPolygons, fetchSpecificPolygon };
