import { useFetchAPI } from "@/lib/utils/useFetchAPI";
import { LocationWithPolygon } from "@customTypes/location/location";

import { FetchLocationsParams } from "../../../app/api/admin/locations/route";
import { FetchLocationsResponse } from "../queries/location";

const _searchLocationsForMap = async () => {
  //Deprecated
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

export const useFetchLocations = () => {
  const url = `/api/admin/locations`;

  return useFetchAPI<FetchLocationsResponse, FetchLocationsParams>({
    url,
    options: {
      method: "GET",
      next: { tags: ["location", "database"] },
    },
  });
};

export { _searchLocationsForMap };
