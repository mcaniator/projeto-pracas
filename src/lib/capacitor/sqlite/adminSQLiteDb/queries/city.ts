import adminSQLiteDb from "@/lib/capacitor/sqlite/adminSQLiteDb/adminSQLiteDb";
import type { FetchCitiesParams } from "@/lib/serverFunctions/queries/city";
import { FetchCitiesResponse } from "@/lib/serverFunctions/queries/city";
import {
  APIRequestParams,
  APIResponse,
  APIResponseInfo,
} from "@/lib/types/backendCalls/APIResponse";
import { BrazilianStates } from "@prisma/client";
import { z } from "zod";

const citySchema = z.array(
  z.object({
    id: z.coerce.number(),
    name: z.string(),
    state: z.nativeEnum(BrazilianStates),
    narrowAdministrativeUnitTitle: z.string().nullable(),
    intermediateAdministrativeUnitTitle: z.string().nullable(),
    broadAdministrativeUnitTitle: z.string().nullable(),
    createdAt: z.coerce.date().nullable(),
    updatedAt: z.coerce.date().nullable(),
  }),
);

const administrativeUnitSchema = z.array(
  z.object({
    id: z.coerce.number(),
    name: z.string(),
    cityId: z.coerce.number(),
  }),
);

const groupAdministrativeUnitsByCity = (
  units: z.infer<typeof administrativeUnitSchema>,
) => {
  return units.reduce((unitsByCity, { cityId, id, name }) => {
    const cityUnits = unitsByCity.get(cityId) ?? [];
    cityUnits.push({ id, name });
    unitsByCity.set(cityId, cityUnits);
    return unitsByCity;
  }, new Map<number, { id: number; name: string }[]>());
};

const fetchAdminSqliteCities = async (
  request: APIRequestParams<FetchCitiesParams>,
): Promise<APIResponse<FetchCitiesResponse>> => {
  const params = request.params!;
  try {
    const cityValues = await adminSQLiteDb.query({
      statement: `
        SELECT
          c.id,
          c.name,
          c.state,
          c.narrow_administrative_unit_title AS narrowAdministrativeUnitTitle,
          c.intermediate_administrative_unit_title AS intermediateAdministrativeUnitTitle,
          c.broad_administrative_unit_title AS broadAdministrativeUnitTitle,
          c.created_at AS createdAt,
          c.updated_at AS updatedAt
        FROM city c
        WHERE c.state = ?
        ${
          params.noEmptyLocations ?
            "AND EXISTS (SELECT 1 FROM location l WHERE l.city_id = c.id)"
          : ""
        }
      `,
      values: [params.state],
    });
    const cities = citySchema.parse(cityValues.values);
    cities.sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });

    const uniqueAdminstrativeUnitsTitles =
      params.includeUniqueAdminstrativeUnitsTitles ?
        {
          narrow: Array.from(
            new Set(
              cities.flatMap((city) =>
                city.narrowAdministrativeUnitTitle ?
                  [city.narrowAdministrativeUnitTitle]
                : [],
              ),
            ),
          ),
          intermediate: Array.from(
            new Set(
              cities.flatMap((city) =>
                city.intermediateAdministrativeUnitTitle ?
                  [city.intermediateAdministrativeUnitTitle]
                : [],
              ),
            ),
          ),
          broad: Array.from(
            new Set(
              cities.flatMap((city) =>
                city.broadAdministrativeUnitTitle ?
                  [city.broadAdministrativeUnitTitle]
                : [],
              ),
            ),
          ),
        }
      : null;

    if (!params.includeAdminstrativeRegions || cities.length === 0) {
      return {
        responseInfo: {
          statusCode: 200,
        } as APIResponseInfo,
        data: {
          cities,
          uniqueAdminstrativeUnitsTitles,
        },
      };
    }

    const cityIds = cities.map((city) => city.id);
    const cityIdsPlaceholders = cityIds.map(() => "?").join(", ");
    const [narrowValues, intermediateValues, broadValues] = await Promise.all([
      adminSQLiteDb.query({
        statement: `SELECT id, name, city_id AS cityId FROM narrow_administrative_unit WHERE city_id IN (${cityIdsPlaceholders})`,
        values: cityIds,
      }),
      adminSQLiteDb.query({
        statement: `SELECT id, name, city_id AS cityId FROM intermediate_administrative_unit WHERE city_id IN (${cityIdsPlaceholders})`,
        values: cityIds,
      }),
      adminSQLiteDb.query({
        statement: `SELECT id, name, city_id AS cityId FROM broad_administrative_unit WHERE city_id IN (${cityIdsPlaceholders})`,
        values: cityIds,
      }),
    ]);

    const narrowAdministrativeUnitsByCity = groupAdministrativeUnitsByCity(
      administrativeUnitSchema.parse(narrowValues.values),
    );
    const intermediateAdministrativeUnitsByCity =
      groupAdministrativeUnitsByCity(
        administrativeUnitSchema.parse(intermediateValues.values),
      );
    const broadAdministrativeUnitsByCity = groupAdministrativeUnitsByCity(
      administrativeUnitSchema.parse(broadValues.values),
    );

    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        cities: cities.map((city) => ({
          ...city,
          narrowAdministrativeUnit:
            narrowAdministrativeUnitsByCity.get(city.id) ?? [],
          intermediateAdministrativeUnit:
            intermediateAdministrativeUnitsByCity.get(city.id) ?? [],
          broadAdministrativeUnit:
            broadAdministrativeUnitsByCity.get(city.id) ?? [],
        })),
        uniqueAdminstrativeUnitsTitles,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        cities: [],
        uniqueAdminstrativeUnitsTitles: null,
      },
    };
  }
};

export { fetchAdminSqliteCities };
