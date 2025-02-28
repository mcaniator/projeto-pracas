"use server";

import { prisma } from "../lib/prisma";

type FetchCitiesType = Awaited<ReturnType<typeof fetchCities>>;

const fetchCities = async () => {
  try {
    const cities = await prisma.city.findMany({
      include: {
        narrowAdministrativeUnit: {
          select: {
            id: true,
            name: true,
          },
        },
        intermediateAdministrativeUnit: {
          select: {
            id: true,
            name: true,
          },
        },
        broadAdministrativeUnit: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    cities.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
    return cities;
  } catch (error) {
    return;
  }
};

export { fetchCities };
export type { FetchCitiesType };
