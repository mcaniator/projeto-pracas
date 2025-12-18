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
  firstStreet: string;
  secondStreet: string;
  thirdStreet: string;
  fourthStreet: string;
  mainImage: string | null;
  popularName: string | null;
  typeId: number;
  categoryId: number;
  notes: string | null;
  incline: number | null;
  isPark: boolean;
  inactiveNotFound: boolean;
  narrowAdministrativeUnitName: string | null;
  intermediateAdministrativeUnitName: string | null;
  broadAdministrativeUnitName: string | null;
  narrowAdministrativeUnitId: number | null;
  intermediateAdministrativeUnitId: number | null;
  broadAdministrativeUnitId: number | null;
  creationYear: number | null;
  lastMaintenanceYear: number | null;
  overseeingMayor: string | null;
  legislation: string | null;
  usableArea: number | null;
  legalArea: number | null;
  assessmentCount: number;
  tallyCount: number;
  categoryName: string | null;
  typeName: string | null;
  st_asgeojson: string | null;
};

export { type LocationWithPolygon, type LocationsWithPolygonResponse };
