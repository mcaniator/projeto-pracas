"use server";

import { prisma } from "@/lib/prisma";
import { locationSchema } from "@/lib/zodValidators";
import { BrazilianStates, Location, Prisma } from "@prisma/client";
import { revalidateTag, unstable_cache } from "next/cache";
import { z } from "zod";

import { ufToStateMap } from "../lib/types/brazilianFederativeUnits";
import { getPolygonsFromShp } from "./getPolygonsFromShp";
import { addPolygonFromWKT, hasPolygon } from "./managePolygons";

interface LocationWithCity extends Location {
  narrowAdministrativeUnit: {
    id: number;
    name: string;
    city: {
      name: string;
      state: BrazilianStates;
    } | null;
  } | null;
  intermediateAdministrativeUnit: {
    id: number;
    name: string;
    city: {
      name: string;
      state: BrazilianStates;
    } | null;
  } | null;
  broadAdministrativeUnit: {
    id: number;
    name: string;
    city: {
      name: string;
      state: BrazilianStates;
    } | null;
  } | null;
}

const deleteLocation = async (parkID: number) => {
  try {
    await prisma.location.delete({
      where: {
        id: parkID,
      },
    });
    revalidateTag("location");
    return { statusCode: 200 };
  } catch (err) {
    return { statusCode: 500 };
  }
};

const fetchLocations = async () => {
  const locationsType = Prisma.validator<Prisma.LocationDefaultArgs>()({
    select: { id: true, name: true },
  });

  let locations: Prisma.LocationGetPayload<typeof locationsType>[] = [];

  try {
    locations = await prisma.location.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  } catch (err) {
    // console.error(`Erro ao recuperar locais`, err);
  }

  return locations;
};

const searchLocationsByName = async (name: string) => {
  const cachedLocations = unstable_cache(
    async (name: string): Promise<Location[]> => {
      if (name.length < 2) return [];

      let foundLocations: Location[] = [];

      try {
        foundLocations = await prisma.location.findMany({
          where: {
            name: {
              contains: name,
              mode: "insensitive",
            },
          },
        });
      } catch (err) {
        // console.error(err);
      }

      return foundLocations;
    },
    ["searchLocationsByNameCache"],
    { tags: ["location", "database"] },
  );

  return await cachedLocations(name);
};

const searchLocationsById = async (id: number) => {
  const cachedLocations = unstable_cache(
    async (id: number): Promise<LocationWithCity | undefined | null> => {
      let foundLocation;
      try {
        foundLocation = await prisma.location.findUnique({
          where: {
            id: id,
          },
          include: {
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
        const locationHasPolygon = await hasPolygon(id);
        //TODO
      } catch (err) {
        // console.error(err);
      }

      return foundLocation;
    },
    ["searchLocationsByIdCache"],
    { tags: ["location", "database"] },
  );

  return await cachedLocations(id);
};

const searchLocationNameById = async (id: number) => {
  const location = await prisma.location.findUnique({
    where: {
      id: id,
    },
    select: {
      name: true,
    },
  });
  if (location) return location.name;
  else return "Erro ao encontrar nome";
};

const updateLocation = async (
  prevState: { statusCode: number; message: string },
  formData: FormData,
) => {
  let parseId;
  try {
    parseId = z.coerce
      .number()
      .int()
      .finite()
      .nonnegative()
      .parse(formData.get("locationId"));
  } catch (e) {
    console.log(e);
    return {
      statusCode: 400,
      message: "Invalid id",
    };
  }

  let locationToUpdate;
  const narrowAdministrativeUnitName = formData.get("narrowAdministrativeUnit");
  const intermediateAdministrativeUnitName = formData.get(
    "intermediateAdministrativeUnit",
  );
  const broadAdministrativeUnitName = formData.get("broadAdministrativeUnit");

  const cityName = formData.get("city");
  const stateName = ufToStateMap.get(formData.get("state") as string);
  if (cityName && stateName === "NONE") {
    return { statusCode: 400, message: "City sent without state" };
  }
  try {
    locationToUpdate = locationSchema.parse({
      name: formData.get("name"),
      firstStreet: formData.get("firstStreet"),
      secondStreet: formData.get("secondStreet"),
      creationYear: formData.get("creationYear"),
      lastMaintenanceYear: formData.get("lastMaintenanceYear"),
      overseeingMayor: formData.get("overseeingMayor"),
      legislation: formData.get("legislation"),
      legalArea: formData.get("legalArea"),
      usableArea: formData.get("usableArea"),
      incline: formData.get("incline"),
      notes: formData.get("notes"),
      isPark: formData.get("isPark") === "true",
      inactiveNotFound: formData.get("inactiveNotFound") === "true",
    });
  } catch (e) {
    console.log(e);
    return {
      statusCode: 400,
      message: "Invalid data",
    };
  }
  let result;
  try {
    if (cityName) {
      const city = await prisma.city.upsert({
        where: {
          name_state: {
            name: cityName as string,
            state: stateName as BrazilianStates,
          },
        },
        update: {},
        create: {
          name: cityName as string,
          state: stateName as BrazilianStates,
        },
      });
      let narrowAdministrativeUnitId: number | null = null;
      let intermediateAdministrativeUnitId: number | null = null;
      let broadAdministrativeUnitId: number | null = null;
      if (narrowAdministrativeUnitName) {
        const narrowAdministrativeUnit =
          await prisma.narrowAdministrativeUnit.upsert({
            where: {
              cityId_narrowUnitName: {
                cityId: city.id,
                name: narrowAdministrativeUnitName as string,
              },
            },
            update: {},
            create: {
              name: narrowAdministrativeUnitName as string,
              city: {
                connect: { id: city.id },
              },
            },
          });
        narrowAdministrativeUnitId = narrowAdministrativeUnit.id;
        console.log(narrowAdministrativeUnitId);
      }
      if (intermediateAdministrativeUnitName) {
        const intermediateAdministrativeUnit =
          await prisma.intermediateAdministrativeUnit.upsert({
            where: {
              cityId_intermediateUnitName: {
                cityId: city.id,
                name: intermediateAdministrativeUnitName as string,
              },
            },
            update: {},
            create: {
              name: intermediateAdministrativeUnitName as string,
              city: {
                connect: { id: city.id },
              },
            },
          });
        intermediateAdministrativeUnitId = intermediateAdministrativeUnit.id;
      }
      if (broadAdministrativeUnitName) {
        const broadAdministrativeUnit =
          await prisma.broadAdministrativeUnit.upsert({
            where: {
              cityId_broadUnitName: {
                cityId: city.id,
                name: broadAdministrativeUnitName as string,
              },
            },
            update: {},
            create: {
              name: broadAdministrativeUnitName as string,
              city: {
                connect: { id: city.id },
              },
            },
          });
        broadAdministrativeUnitId = broadAdministrativeUnit.id;
      }
      result = await prisma.location.update({
        where: {
          id: parseId,
        },
        data: {
          ...locationToUpdate,
          narrowAdministrativeUnitId,
          intermediateAdministrativeUnitId,
          broadAdministrativeUnitId,
        },
      });
    } else {
      result = await prisma.location.update({
        where: {
          id: parseId,
        },
        data: {
          ...locationToUpdate,
        },
      });
    }
  } catch (e) {
    console.log(e);
    return { statusCode: 400, message: "Database error" };
  }
  console.log("success");
  const shpFile = formData.get("file");
  if (!shpFile) {
    revalidateTag("location");
    return { statusCode: 200, message: "Location updated" };
  }
  try {
    const WKT = await getPolygonsFromShp(formData.get("file") as File);
    console.log(WKT);
    WKT && (await addPolygonFromWKT(WKT, parseId));
    revalidateTag("location");
    return { statusCode: 200, message: "Location updated" };
  } catch (e) {
    console.log(e);
    return { statusCode: 400, message: "Error during polygon save" };
  }
};
//TO DO -> UPDATE POLYGONS
//      -> CHECK CACHE NOT RESETING
//      -> CHECK ADMINISTRATIVE UNIT NOT UPDATING
///////////////////////////////////
/*const city = await prisma.city.upsert({
        where: {
          name_state: {
            name: cityName,
            state: stateName as BrazilianStates,
          },
        },
        update: {},
        create: {
          name: cityName,
          state: stateName as BrazilianStates,
        },
      });

      let narrowAdministrativeUnitId: number | null = null;
      let intermediateAdministrativeUnitId: number | null = null;
      let broadAdministrativeUnitId: number | null = null;
      if (narrowAdministrativeUnitName) {
        const narrowAdministrativeUnit =
          await prisma.narrowAdministrativeUnit.upsert({
            where: {
              cityId_narrowUnitName: {
                cityId: city.id,
                name: narrowAdministrativeUnitName as string,
              },
            },
            update: {},
            create: {
              name: narrowAdministrativeUnitName as string,
              city: {
                connect: { id: city.id },
              },
            },
          });
        narrowAdministrativeUnitId = narrowAdministrativeUnit.id;
      }
      if (intermediateAdministrativeUnitName) {
        const intermediateAdministrativeUnit =
          await prisma.intermediateAdministrativeUnit.upsert({
            where: {
              cityId_intermediateUnitName: {
                cityId: city.id,
                name: intermediateAdministrativeUnitName as string,
              },
            },
            update: {},
            create: {
              name: intermediateAdministrativeUnitName as string,
              city: {
                connect: { id: city.id },
              },
            },
          });
        intermediateAdministrativeUnitId = intermediateAdministrativeUnit.id;
      }
      if (broadAdministrativeUnitName) {
        const broadAdministrativeUnit =
          await prisma.broadAdministrativeUnit.upsert({
            where: {
              cityId_broadUnitName: {
                cityId: city.id,
                name: broadAdministrativeUnitName as string,
              },
            },
            update: {},
            create: {
              name: broadAdministrativeUnitName as string,
              city: {
                connect: { id: city.id },
              },
            },
          });
        broadAdministrativeUnitId = broadAdministrativeUnit.id;
      }
      await prisma.location.update({
        where: { id: parseId },
        data: {
          ...locationToUpdate,
          ...(narrowAdministrativeUnitId && {
            narrowAdministrativeUnit: {
              connect: { id: narrowAdministrativeUnitId },
            },
          }),
          ...(intermediateAdministrativeUnitId && {
            intermediateAdministrativeUnit: {
              connect: { id: intermediateAdministrativeUnitId },
            },
          }),
          ...(broadAdministrativeUnitId && {
            broadAdministrativeUnit: {
              connect: { id: broadAdministrativeUnitId },
            },
          }),
        },
      });
      if (!formData.get("file")) {
        revalidateTag("location");
        return { statusCode: 200, message: "Location updated" };
      }
    } else {
      await prisma.location.update({
        where: { id: parseId },
        data: locationToUpdate,
      });
      if (!formData.get("file")) {
        revalidateTag("location");
        return { statusCode: 200, message: "Location updated" };
      }
    }
  } catch (e) {
    revalidateTag("location");
    return {
      statusCode: 500,
      message: "Internal server error",
    };
  }*/

/*try {
    const WKT = await getPolygonsFromShp(formData.get("file") as File);
    WKT && (await addPolygonFromWKT(WKT, parseId));
    revalidateTag("location");
    return { statusCode: 200, message: "Location updated" };
  } catch (e) {
    return { statusCode: 200, message: "Error during polygon save" };
  }*/

export {
  fetchLocations,
  deleteLocation,
  searchLocationsById,
  searchLocationsByName,
  searchLocationNameById,
  updateLocation,
};

export type { LocationWithCity };
