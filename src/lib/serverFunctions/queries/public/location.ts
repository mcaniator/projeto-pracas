import { PublicFetchLocationsParams } from "@/app/api/public/locations/route";
import { prisma } from "@/lib/prisma";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import { PublicLocationForMap } from "@/lib/types/location/location";
import { buildImageUrl } from "@/lib/utils/image";

export type PublicFetchLocationsResponse = NonNullable<
  Awaited<ReturnType<typeof publicFetchLocations>>["data"]
>;

export const publicFetchLocations = async (
  params: PublicFetchLocationsParams,
) => {
  try {
    const locations = await prisma.$queryRaw<Array<PublicLocationForMap>>`
  SELECT DISTINCT
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
    END AS st_asgeojson
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
  WHERE l.is_public = ${true} 
  AND l.id = COALESCE(${params.locationId}, l.id) 
  AND l.city_id = COALESCE(${params.cityId}, l.city_id)
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
