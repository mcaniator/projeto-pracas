"use server";

import { MultiPolygon, Polygon } from "geojson";
import { parseShp } from "shpjs";

const getPolygonsFromShp = async (shpFile: File) => {
  if (!shpFile.name.toLowerCase().endsWith(".shp")) return null;

  const geometryArray = parseShp(await shpFile.arrayBuffer());

  let multiPolygonAmount = 0;
  let polygonAmount = 0;

  const validGeometricalTypes = geometryArray.filter((geometry) => {
    const isPolygon = geometry.type === "Polygon";
    const isMultiPolygon = geometry.type === "MultiPolygon";

    if (isPolygon) polygonAmount++;
    else if (isMultiPolygon) multiPolygonAmount++;

    return isPolygon || isMultiPolygon;
  }) as (Polygon | MultiPolygon)[]; // Typescript doesn't correctly identify this as a (Polygon or MultiPolygon)[] so a type assertion is necessary

  // TODO ask if these are actual issues that should be accounted for
  if (
    validGeometricalTypes.length === 0 ||
    multiPolygonAmount > 1 || // Shapefiles with more than one multiPolygon are very likely user error containing more than one park polygon in a single file
    (polygonAmount !== 0 && multiPolygonAmount !== 0) // Shapefiles with a mix of types are also very likely to be user error
  )
    return null;

  let polygonArray;
  if (polygonAmount !== 0) {
    // Gets each individual polygon from the polygon array and maps it to a string
    polygonArray = (validGeometricalTypes as Polygon[]).map((geometry) => {
      const polygon = mapPolygon(geometry.coordinates);

      return polygon;
    });
  } else {
    // Since we only accept multiPolygon files if they contain exactly 1 multiPolygon I can get the first index of an array and assert that it isn't undefined
    const multiPolygon = (validGeometricalTypes as MultiPolygon[])[0]!;
    // MultiPolygons contain the equivalent of more than one polygon in their coordinates array so we map them to parse each individually as if they were separate polygons
    polygonArray = multiPolygon.coordinates.map(mapPolygon);
  }

  const multiPolygonJoined = polygonArray.join(", ");
  const multiPolygonString = `MULTIPOLYGON(${multiPolygonJoined})`;

  return multiPolygonString;
};

const mapPolygon = (coordinates: number[][][]) => {
  // Polygon and Holes Array eg.: [(), (), (), ()]
  const polygonsArray = coordinates.map((ring) => {
    // X and Y coordinate pair array
    const coordinatesPairArray = ring.map((array) => `${array[0]} ${array[1]}`);

    // Connects X and Y coordinate pairs with commas eg.: 5 4, 1 3, 6, 7
    const polygonCoordinates = coordinatesPairArray.join(", ");

    return `(${polygonCoordinates})`;
  });

  // Connects polygon and holes into a comma seperated string eg.: (), (), (), ()
  const polygonString = polygonsArray.join(", ");

  return `(${polygonString})`;
};

export { getPolygonsFromShp };
