import {
  LocationForMap,
  LocationWithPolygon,
} from "@customTypes/location/location";
import { prisma } from "@lib/prisma";
import { Prisma } from "@prisma/client";
import { hasPolygon } from "@serverOnly/geometries";

import { FetchLocationsParams } from "../../../app/api/admin/locations/route";
import { APIResponseInfo } from "../../types/backendCalls/APIResponse";
import {
  generatePaginationResponseInfo,
  generatePrismaPaginationObject,
} from "../../utils/apiCall";

const fetchLocationsNames = async () => {
  try {
    const locations = await prisma.location.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return { statusCode: 200, locations };
  } catch (e) {
    return { statusCode: 500, locations: [] };
  }
};

const searchLocationsById = async (id: number) => {
  let foundLocation;
  try {
    foundLocation = await prisma.location.findUnique({
      where: {
        id: id,
      },
      include: {
        category: true,
        type: true,
        narrowAdministrativeUnit: {
          select: {
            id: true,
            name: true,
            city: {
              select: {
                name: true,
                state: true,
              },
            },
          },
        },
        intermediateAdministrativeUnit: {
          select: {
            id: true,
            name: true,
            city: {
              select: {
                name: true,
                state: true,
              },
            },
          },
        },
        broadAdministrativeUnit: {
          select: {
            id: true,
            name: true,
            city: {
              select: {
                name: true,
                state: true,
              },
            },
          },
        },
      },
    });
    if (!foundLocation) {
      return { statusCode: 404, location: null };
    }
    const locationHasPolygon = await hasPolygon(id);

    foundLocation = {
      ...foundLocation,
      hasGeometry: locationHasPolygon ?? false,
    };
    return { statusCode: 200, location: foundLocation };
  } catch (err) {
    return { statusCode: 500, location: null };
  }
};

const searchLocationNameById = async (id: number) => {
  try {
    const location = await prisma.location.findUnique({
      where: {
        id: id,
      },
      select: {
        name: true,
      },
    });
    return { statusCode: 200, locationName: location?.name };
  } catch (e) {
    return { statusCode: 500, locationName: null };
  }
};

const searchLocationsForMap = async () => {
  try {
    const locations = await prisma.$queryRaw<Array<LocationWithPolygon>>`
          SELECT 
            id,
            name,
            ST_AsGeoJSON(polygon)::text as st_asgeojson
          FROM location 
        `;
    return { statusCode: 200, locations };
  } catch (e) {
    return { statusCode: 500, locations: [] } as {
      statusCode: number;
      locations: LocationWithPolygon[];
    };
  }
};

export type FetchLocationsResponse = NonNullable<
  Awaited<ReturnType<typeof fetchLocations>>["data"]
>;

export const fetchLocations = async (params: FetchLocationsParams) => {
  try {
    const locations = await prisma.$queryRaw<Array<LocationForMap>>`
  SELECT
    l.id,
    l.name,
    l.image,
    l.type_id      AS "typeId",
    l.category_id  AS "categoryId",
    l.popular_name AS "popularName",
    COUNT(DISTINCT a.id) AS "assessmentCount",
    COUNT(DISTINCT t.id) AS "tallyCount",
    ST_AsGeoJSON(l.polygon)::text AS st_asgeojson
  FROM location l
  LEFT JOIN assessment a ON a.location_id = l.id
  LEFT JOIN tally t      ON t.location_id = l.id
  WHERE l.city_id = ${params.cityId}
  GROUP BY 
    l.id, l.name, l.image, l.type_id, l.category_id, l.st_asgeojson
`;
    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        locations: locations,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar praças!",
      } as APIResponseInfo,
      data: {
        locations: [],
      },
    };
  }
};
export {
  searchLocationsById,
  searchLocationNameById,
  fetchLocationsNames,
  searchLocationsForMap,
};
