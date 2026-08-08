import { prisma } from "@/lib/prisma";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import { z } from "zod";

export const sqliteSyncParamsSchema = z.object({
  userId: z.string(),
  cityId: z.coerce.number(),
});

export type SQLiteSyncParams = z.infer<typeof sqliteSyncParamsSchema>;

export type FetchSQLiteSyncDataResponse = NonNullable<
  Awaited<ReturnType<typeof fetchSQLiteSyncData>>["data"]
>;
export const fetchSQLiteSyncData = async (params: SQLiteSyncParams) => {
  const getCurrentUserData = prisma.user.findUnique({
    where: {
      id: params.userId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      image: true,
      active: true,
      roles: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const getCityData = prisma.city.findUnique({
    where: {
      id: params.cityId,
    },
    select: {
      id: true,
      name: true,
      state: true,
      narrowAdministrativeUnitTitle: true,
      intermediateAdministrativeUnitTitle: true,
      broadAdministrativeUnitTitle: true,
      createdAt: true,
      updatedAt: true,
      narrowAdministrativeUnit: true,
      intermediateAdministrativeUnit: true,
      broadAdministrativeUnit: true,
      locations: true,
    },
  });

  const getLocationCategoryData = prisma.locationCategory.findMany();
  const getLocationTypeData = prisma.locationType.findMany();
  const getLocationPolygons = prisma.$queryRaw<
    Array<{ id: number; polygon: string | null }>
  >`
    SELECT
      id,
      CASE
        WHEN ST_IsEmpty(polygon) THEN NULL
        ELSE ST_AsGeoJSON(polygon)::text
      END AS polygon
    FROM location
    WHERE city_id = ${params.cityId}
  `;
  try {
    const [
      currentUser,
      cityData,
      locationCategory,
      locationType,
      locationPolygons,
    ] = await prisma.$transaction([
      getCurrentUserData,
      getCityData,
      getLocationCategoryData,
      getLocationTypeData,
      getLocationPolygons,
    ]);
    if (!currentUser || !cityData)
      return {
        responseInfo: {
          statusCode: 404,
          message: "Dados não encontrados!",
        } as APIResponseInfo,
      };
    const city = {
      id: cityData.id,
      name: cityData.name,
      state: cityData.state,
      narrowAdministrativeUnitTitle: cityData.narrowAdministrativeUnitTitle,
      intermediateAdministrativeUnitTitle:
        cityData.intermediateAdministrativeUnitTitle,
      broadAdministrativeUnitTitle: cityData.broadAdministrativeUnitTitle,
      createdAt: cityData.createdAt,
      updatedAt: cityData.updatedAt,
    };
    const narrowAdministrativeUnits = cityData.narrowAdministrativeUnit;
    const intermediateAdministrativeUnits =
      cityData.intermediateAdministrativeUnit;
    const broadAdministrativeUnits = cityData.broadAdministrativeUnit;
    const polygonsByLocationId = new Map(
      locationPolygons.map((location) => [location.id, location.polygon]),
    );
    const locations = cityData.locations.map((location) => ({
      ...location,
      polygon: polygonsByLocationId.get(location.id) ?? null,
    }));
    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: {
        currentUser: currentUser,
        city,
        narrowAdministrativeUnits,
        intermediateAdministrativeUnits,
        broadAdministrativeUnits,
        locationCategory,
        locationType,
        locations,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar dados!",
      } as APIResponseInfo,
    };
  }
};
