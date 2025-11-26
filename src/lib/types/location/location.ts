type LocationWithPolygon = {
  id: number;
  name: string;
  st_asgeojson: string | null;
};

type LocationsWithPolygonResponse = {
  statusCode: number;
  locations: LocationWithPolygon[];
};

export type LocationForMap = {
  id: number;
  name: string;
  popularName: string | null;
  typeId: number;
  categoryId: number;
  assessmentCount: number;
  tallyCount: number;
  st_asgeojson: string | null;
};

export { type LocationWithPolygon, type LocationsWithPolygonResponse };
