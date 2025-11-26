import { LocationWithPolygon } from "@customTypes/location/location";

import { FetchLocationsParams } from "../../../app/api/admin/locations/route";
import { fetchAPI } from "../../utils/apiCall";
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

export const _fetchLocations = async (params: FetchLocationsParams) => {
  const url = `/api/admin/locations`;

  const response = await fetchAPI<FetchLocationsResponse>({
    url,
    params,
    options: {
      method: "GET",
      next: { tags: ["location", "database"] },
    },
  });

  return response;
};

export { _searchLocationsForMap };
