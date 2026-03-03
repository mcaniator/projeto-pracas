import { buildImageUrl } from "@/lib/utils/image";
import { LocationForMap } from "@customTypes/location/location";
import { prisma } from "@lib/prisma";

import { FetchLocationsParams } from "../../../app/api/admin/locations/route";
import { APIResponseInfo } from "../../types/backendCalls/APIResponse";

export type FetchLocationsResponse = NonNullable<
  Awaited<ReturnType<typeof fetchLocations>>["data"]
>;

export const fetchLocations = async (params: FetchLocationsParams) => {
  try {
    const locations = await prisma.$queryRaw<Array<LocationForMap>>`
  SELECT
    l.id,
    l.name,
    l.type_id      AS "typeId",
    l.category_id  AS "categoryId",
    l.popular_name AS "popularName",
    l.first_street AS "firstStreet",
    l.second_street AS "secondStreet",
    l.third_street AS "thirdStreet",
    l.fourth_street AS "fourthStreet",
    l.notes as "notes",
    l.creation_year as "creationYear",
    l.last_maintenance_year as "lastMaintenanceYear",
    l.legislation as "legislation",
    l.usable_area as "usableArea",
    l.legal_area as "legalArea",
    l.incline as "incline",
    l.is_park as "isPark",
    l.inactive_not_found as "inactiveNotFound",
    l.narrow_administrative_unit_id as "narrowAdministrativeUnitId",
    l.intermediate_administrative_unit_id as "intermediateAdministrativeUnitId",
    l.broad_administrative_unit_id as "broadAdministrativeUnitId",
    l.is_public as "isPublic",
    nau.name AS "narrowAdministrativeUnitName",
    iau.name AS "intermediateAdministrativeUnitName",
    bau.name AS "broadAdministrativeUnitName",
    lc.name AS "categoryName",
    lt.name AS "typeName",
    i.relative_path AS "mainImage",
    l.city_id as "cityId",
    c.state as "state",
    c.name as "cityName",
    c.broad_administrative_unit_title as "broadAdministrativeUnitTitle",
    c.intermediate_administrative_unit_title as "intermediateAdministrativeUnitTitle",
    c.narrow_administrative_unit_title as "narrowAdministrativeUnitTitle",
    CASE
      WHEN ST_IsEmpty(l.polygon) THEN NULL
      ELSE ST_AsGeoJSON(l.polygon)::text
    END AS st_asgeojson,
    COUNT(DISTINCT a.id) AS "assessmentCount",
    COUNT(DISTINCT t.id) AS "tallyCount"
  FROM location l
  LEFT JOIN assessment a ON a.location_id = l.id
  LEFT JOIN tally t      ON t.location_id = l.id
  LEFT JOIN narrow_administrative_unit nau ON nau.id = l.narrow_administrative_unit_id
  LEFT JOIN intermediate_administrative_unit iau ON iau.id = l.intermediate_administrative_unit_id
  LEFT JOIN broad_administrative_unit bau ON bau.id = l.broad_administrative_unit_id
  LEFT JOIN location_category lc ON lc.id = l.category_id
  LEFT JOIN location_type lt ON lt.id = l.type_id
  LEFT JOIN image i ON i.image_id = l.main_image_id
  LEFT JOIN city c ON c.id = l.city_id
  WHERE l.id = COALESCE(${params.locationId}, l.id) 
  AND l.city_id = COALESCE(${params.cityId}, l.city_id)
  GROUP BY 
    1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35
`;
    const formatedLocations = locations.map((location) => ({
      ...location,
      mainImage: buildImageUrl(location.mainImage),
    }));
    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        locations: formatedLocations,
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

export const fetchLocationsAssociatedWithAdministrativeUnit = async (
  administrativeUnitId: number,
  administrativeUnitType: "NARROW" | "INTERMEDIATE" | "BROAD",
) => {
  if (administrativeUnitType === "NARROW") {
    const locations = await prisma.location.findMany({
      where: {
        narrowAdministrativeUnitId: administrativeUnitId,
      },
      select: {
        name: true,
        city: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return orderLocationsByCity(locations);
  } else if (administrativeUnitType === "INTERMEDIATE") {
    const locations = await prisma.location.findMany({
      where: {
        intermediateAdministrativeUnitId: administrativeUnitId,
      },
      select: {
        name: true,
        city: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return orderLocationsByCity(locations);
  } else if (administrativeUnitType === "BROAD") {
    const locations = await prisma.location.findMany({
      where: {
        broadAdministrativeUnitId: administrativeUnitId,
      },
      select: {
        name: true,
        city: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return orderLocationsByCity(locations);
  }
};

// Helper function to order locations by city
const orderLocationsByCity = (
  locations: {
    city: {
      id: number;
      name: string;
    };
    name: string;
  }[],
) => {
  const grouped = Object.values(
    locations.reduce(
      (acc, loc) => {
        const cityName = loc.city.name;
        const cityId = loc.city.id;
        if (!acc[cityId]) {
          acc[cityId] = {
            cityName,
            cityId,
            locations: [],
          };
        }

        acc[cityId].locations.push({
          name: loc.name,
        });

        return acc;
      },
      {} as Record<
        number,
        {
          cityId: number;
          cityName: string;
          locations: { name: string }[];
        }
      >,
    ),
  );
  return grouped;
};
