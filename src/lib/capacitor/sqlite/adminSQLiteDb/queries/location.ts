import adminSQLiteDb from "@/lib/capacitor/sqlite/adminSQLiteDb/adminSQLiteDb";
import { sqliteBooleanSchema } from "@/lib/capacitor/sqlite/helpers";
import type { FetchLocationsParams } from "@/lib/serverFunctions/queries/location";
import { FetchLocationsResponse } from "@/lib/serverFunctions/queries/location";
import {
  APIRequestParams,
  APIResponse,
  APIResponseInfo,
} from "@/lib/types/backendCalls/APIResponse";
import { BrazilianStates } from "@prisma/client";
import { z } from "zod";

const locationsSchema = z.array(
  z.object({
    id: z.coerce.number(),
    name: z.string(),
    typeId: z.coerce.number(),
    categoryId: z.coerce.number(),
    popularName: z.string().nullable(),
    firstStreet: z.string(),
    secondStreet: z.string().nullable(),
    thirdStreet: z.string().nullable(),
    fourthStreet: z.string().nullable(),
    notes: z.string().nullable(),
    creationYear: z.coerce.number().nullable(),
    lastMaintenanceYear: z.coerce.number().nullable(),
    legislation: z.string().nullable(),
    usableArea: z.coerce.number().nullable(),
    legalArea: z.coerce.number().nullable(),
    incline: z.coerce.number().nullable(),
    isPark: sqliteBooleanSchema,
    inactiveNotFound: sqliteBooleanSchema,
    narrowAdministrativeUnitId: z.coerce.number().nullable(),
    intermediateAdministrativeUnitId: z.coerce.number().nullable(),
    broadAdministrativeUnitId: z.coerce.number().nullable(),
    isPublic: sqliteBooleanSchema,
    narrowAdministrativeUnitName: z.string().nullable(),
    intermediateAdministrativeUnitName: z.string().nullable(),
    broadAdministrativeUnitName: z.string().nullable(),
    categoryName: z.string().nullable(),
    typeName: z.string().nullable(),
    mainImage: z.null(),
    cityId: z.coerce.number(),
    state: z.nativeEnum(BrazilianStates),
    cityName: z.string(),
    broadAdministrativeUnitTitle: z.string().nullable(),
    intermediateAdministrativeUnitTitle: z.string().nullable(),
    narrowAdministrativeUnitTitle: z.string().nullable(),
    st_asgeojson: z.string().nullable(),
    latestAssessmentId: z.null(),
    assessmentCount: z.coerce.number(),
    tallyCount: z.literal(0),
  }),
);

const fetchAdminSQLiteLocations = async (
  request: APIRequestParams<FetchLocationsParams>,
): Promise<APIResponse<FetchLocationsResponse>> => {
  const params = request.params!;
  try {
    const values: number[] = [];
    const where: string[] = ["1 = 1"];

    if (params.locationId != null) {
      where.push("l.id = ?");
      values.push(params.locationId);
    }
    if (params.cityId != null) {
      where.push("l.city_id = ?");
      values.push(params.cityId);
    }

    const locationsValues = await adminSQLiteDb.query({
      statement: `
        SELECT
          l.id,
          l.name,
          l.type_id AS typeId,
          l.category_id AS categoryId,
          l.popular_name AS popularName,
          l.first_street AS firstStreet,
          l.second_street AS secondStreet,
          l.third_street AS thirdStreet,
          l.fourth_street AS fourthStreet,
          l.notes AS notes,
          l.creation_year AS creationYear,
          l.last_maintenance_year AS lastMaintenanceYear,
          l.legislation AS legislation,
          l.usable_area AS usableArea,
          l.legal_area AS legalArea,
          l.incline AS incline,
          l.is_park AS isPark,
          l.inactive_not_found AS inactiveNotFound,
          l.narrow_administrative_unit_id AS narrowAdministrativeUnitId,
          l.intermediate_administrative_unit_id AS intermediateAdministrativeUnitId,
          l.broad_administrative_unit_id AS broadAdministrativeUnitId,
          l.is_public AS isPublic,
          nau.name AS narrowAdministrativeUnitName,
          iau.name AS intermediateAdministrativeUnitName,
          bau.name AS broadAdministrativeUnitName,
          lc.name AS categoryName,
          lt.name AS typeName,
          NULL AS mainImage,
          l.city_id AS cityId,
          c.state AS state,
          c.name AS cityName,
          c.broad_administrative_unit_title AS broadAdministrativeUnitTitle,
          c.intermediate_administrative_unit_title AS intermediateAdministrativeUnitTitle,
          c.narrow_administrative_unit_title AS narrowAdministrativeUnitTitle,
          l.polygon AS st_asgeojson,
          NULL AS latestAssessmentId,
          COUNT(DISTINCT a.id) AS assessmentCount,
          0 AS tallyCount
        FROM location l
        LEFT JOIN assessment a ON a.location_id = l.id
        LEFT JOIN narrow_administrative_unit nau ON nau.id = l.narrow_administrative_unit_id
        LEFT JOIN intermediate_administrative_unit iau ON iau.id = l.intermediate_administrative_unit_id
        LEFT JOIN broad_administrative_unit bau ON bau.id = l.broad_administrative_unit_id
        LEFT JOIN location_category lc ON lc.id = l.category_id
        LEFT JOIN location_type lt ON lt.id = l.type_id
        LEFT JOIN city c ON c.id = l.city_id
        WHERE ${where.join(" AND ")}
        GROUP BY
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
          19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,
          35, 36
      `,
      values,
    });

    const locations = locationsSchema.parse(locationsValues.values);

    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        locations,
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

export { fetchAdminSQLiteLocations };
