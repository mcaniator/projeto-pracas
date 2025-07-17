import { prisma } from "@lib/prisma";
import { hasPolygon } from "@serverOnly/geometries";

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

export { searchLocationsById, searchLocationNameById, fetchLocationsNames };
