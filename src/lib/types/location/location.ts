type LocationWithPolygon = {
  id: number;
  name: string;
  st_asgeojson: string | null;
};

type LocationsWithPolygonResponse = {
  statusCode: number;
  locations: LocationWithPolygon[];
};

export { type LocationWithPolygon, type LocationsWithPolygonResponse };
