"use server";

import { prisma } from "@/lib/prisma";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import { deleteImage, uploadImage } from "@/lib/utils/image";
import { locationSchema } from "@/lib/zodValidators";
import { BrazilianStates, Image, Location } from "@prisma/client";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import {
  addPolygon,
  addPolygonFromWKT,
  getPolygonsFromShp,
} from "@serverOnly/geometries";
import { revalidateTag } from "next/cache";
import { z } from "zod";

interface LocationWithCity extends Location {
  hasGeometry: boolean;
  type: {
    id: number;
    name: string;
  } | null;
  category: {
    id: number;
    name: string;
  } | null;
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

const _deleteLocation = async (
  prevState: { responseInfo: APIResponseInfo },
  formData: FormData,
) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["PARK_MANAGER"] });
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 401,
        message: "Sem permissão para excluir praças!",
      } as APIResponseInfo,
    };
  }
  try {
    const id = z.coerce.number().parse(formData.get("id"));
    try {
      const location = await prisma.location.findUnique({
        where: {
          id,
        },
        select: {
          name: true,
          mainImage: {
            select: {
              fileUid: true,
            },
          },
          _count: {
            select: { tally: true, assessment: true },
          },
        },
      });
      if (!location) {
        return {
          responseInfo: {
            statusCode: 404,
            message: "Praça nao encontrada!",
          } as APIResponseInfo,
        };
      }

      if (location._count.tally > 0 || location._count.assessment > 0) {
        return {
          responseInfo: {
            statusCode: 403,
            message: `Esta praça possui ${location._count.assessment} avaliações e ${location._count.tally} contagens!`,
          } as APIResponseInfo,
        };
      }

      if (location.mainImage) {
        await deleteImage(location.mainImage.fileUid);
      }

      const deletedLocation = await prisma.location.delete({
        where: {
          id,
        },
        select: {
          name: true,
        },
      });
      revalidateTag("location");
      return {
        responseInfo: {
          statusCode: 200,
          message: `Praça ${deletedLocation.name} excluida!`,
          showSuccessCard: true,
        } as APIResponseInfo,
      };
    } catch (err) {
      return {
        responseInfo: {
          statusCode: 500,
          message: "Erro ao excluir praça!",
        } as APIResponseInfo,
      };
    }
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 403,
        meessage: "Dados inválidos!",
      } as APIResponseInfo,
    };
  }
};

const _updateLocation = async (
  //TODO: REMOVE! Creation and update should be in the same function
  prevState: { statusCode: number; message: string },
  formData: FormData,
) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["PARK_MANAGER"] });
  } catch (e) {
    return { statusCode: 401, message: "Invalid permission" };
  }
  let parseId;
  try {
    parseId = z.coerce
      .number()
      .int()
      .finite()
      .nonnegative()
      .parse(formData.get("locationId"));
  } catch (e) {
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
  const stateName = formData.get("state") as string;
  if (cityName && stateName === "NONE") {
    return { statusCode: 400, message: "City sent without state" };
  }
  try {
    locationToUpdate = locationSchema.parse({
      name: formData.get("name"),
      popularName: formData.get("popularName"),
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
    return {
      statusCode: 400,
      message: "Invalid data",
    };
  }
  try {
    await prisma.$transaction(async (prisma) => {
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
      if (
        !narrowAdministrativeUnitId &&
        !intermediateAdministrativeUnitId &&
        !broadAdministrativeUnitId
      ) {
        throw new Error("No administrative unit created or connect");
      }

      const category = formData.get("category");
      const categoryValue =
        category === "" || category === null ? null : String(category);
      const type = formData.get("type");
      const typeValue = category === "" || type === null ? null : String(type);
      let locationTypeId: number | null = null;
      if (typeValue) {
        const locationType = await prisma.locationType.upsert({
          where: {
            name: typeValue,
          },
          update: {},
          create: {
            name: typeValue,
          },
        });
        locationTypeId = locationType.id;
      }
      let locationCategoryId: number | null = null;
      if (categoryValue) {
        const locationCategory = await prisma.locationCategory.upsert({
          where: {
            name: categoryValue,
          },
          update: {},
          create: {
            name: categoryValue,
          },
        });
        locationCategoryId = locationCategory.id;
      }

      await prisma.location.update({
        where: {
          id: parseId,
        },
        data: {
          ...locationToUpdate,
          narrowAdministrativeUnitId,
          intermediateAdministrativeUnitId,
          broadAdministrativeUnitId,
          typeId: locationTypeId,
          categoryId: locationCategoryId,
        },
      });
    });

    const shpFile = formData.get("file");
    if (!shpFile) {
      revalidateTag("location");
      return { statusCode: 200, message: "Location updated" };
    }
    try {
      const WKT = await getPolygonsFromShp(formData.get("file") as File);
      WKT && (await addPolygonFromWKT(WKT, parseId, prisma));
      revalidateTag("location");
      return { statusCode: 200, message: "Location updated" };
    } catch (e) {
      return { statusCode: 400, message: "Error during polygon save" };
    }
  } catch (e) {
    return { statusCode: 400, message: "Database error" };
  }
};

const _createLocation = async (
  _curStatus: { responseInfo: APIResponseInfo },
  formData: FormData,
) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["PARK_MANAGER"] });
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 401,
        message: "Invalid permission",
      } as APIResponseInfo,
    };
  }

  try {
    const locationData = locationSchema.parse({
      name: z.coerce
        .string()
        .trim()
        .max(255)
        .min(1)
        .parse(formData.get("name")),
      popularName: formData.get("popularName"),
      firstStreet: formData.get("firstStreet"),
      secondStreet: formData.get("secondStreet"),
      thirdStreet: formData.get("thirdStreet"),
      fourthStreet: formData.get("fourthStreet"),
      cityId: formData.get("cityId"),
      notes: formData.get("notes"),
      creationYear: formData.get("creationYear"),
      lastMaintenanceYear: formData.get("lastMaintenanceYear"),
      overseeingMayor: formData.get("overseeingMayor"),
      legislation: formData.get("legislation"),
      legalArea: formData.get("legalArea"),
      usableArea: formData.get("usableArea"),
      incline: formData.get("incline"),
      isPark: formData.get("isPark"),
      inactiveNotFound: formData.get("inactiveNotFound"),
      categoryId: formData.get("categoryId"),
      typeId: formData.get("typeId"),
      narrowAdministrativeUnitId: formData.get("narrowAdministrativeUnitId"),
      intermediateAdministrativeUnitId: formData.get(
        "intermediateAdministrativeUnitId",
      ),
      broadAdministrativeUnitId: formData.get("broadAdministrativeUnitId"),
    });

    const locationId = z.coerce
      .number()
      .int()
      .finite()
      .nonnegative()
      .nullish()
      .parse(formData.get("locationId"));

    const formImage = formData.get("mainImage") as File | null;
    let image: Image | null = null;
    try {
      if (formImage) {
        image = await uploadImage(formImage);
      }
      if (locationId) {
        const location = await prisma.location.update({
          data: {
            ...locationData,
          },
          where: {
            id: locationId,
          },
        });
        return {
          responseInfo: {
            statusCode: 201,
            showSuccessCard: true,
            message: `Praça ${location.name} atualizada!`,
          } as APIResponseInfo,
        };
      }
      let locationName = "";
      await prisma.$transaction(async (prisma) => {
        const location = await prisma.location.create({
          data: {
            ...locationData,
            mainImageId: image?.imageId,
          },
          select: {
            id: true,
            name: true,
          },
        });
        // Após a criação da localização, adicionar os polígonos
        try {
          if (formData.get("featuresGeoJson")) {
            const featuresGeoJson = z
              .string()
              .parse(formData.get("featuresGeoJson"));

            await addPolygon(featuresGeoJson, location.id, prisma);
          }
          locationName = location.name;
        } catch (err) {
          throw new Error("Error inserting polygon into database");
        }
      });
      revalidateTag("location");
      return {
        responseInfo: {
          statusCode: 201,
          showSuccessCard: true,
          message: `Praça  ${locationName} registrada!`,
        } as APIResponseInfo,
      };
    } catch (err) {
      return {
        responseInfo: {
          statusCode: 500,
          message: "Erro ao registrar praça!",
        } as APIResponseInfo,
      };
    }
  } catch (err) {
    return {
      responseInfo: {
        statusCode: 401,
        message: "Dados inválidos!",
      } as APIResponseInfo,
    };
  }
};

const _editLocationPolygon = async (id: number, featuresGeoJson: string) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["PARK_MANAGER"] });
  } catch (e) {
    return { statusCode: 401 };
  }
  try {
    await addPolygon(featuresGeoJson, id);
    revalidateTag("location");
    return { statusCode: 201 };
  } catch (e) {
    return { statusCode: 500 };
  }
};

export {
  _deleteLocation,
  _updateLocation,
  _createLocation,
  _editLocationPolygon,
};

export type { LocationWithCity };
