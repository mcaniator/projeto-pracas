import { LocationWithPolygon } from "@customTypes/location/location";

const _searchLocationsForMap = async () => {
  const url = `/api/admin/map/locations`;

  const response = await fetch(url, {
    method: "GET",
    next: { tags: ["location", "database"] },
  });

  if (!response.ok) {
    return { statusCode: response.status, locations: [] } as {
      statusCode: number;
      locations: LocationWithPolygon[];
    };
  }
  const locations = (await response.json()) as {
    statusCode: number;
    locations: LocationWithPolygon[];
  };
  return locations;
};

export { _searchLocationsForMap };
