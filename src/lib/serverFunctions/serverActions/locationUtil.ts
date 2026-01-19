"use server";

import { prisma } from "@/lib/prisma";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import { deleteImage, uploadImage } from "@/lib/utils/image";
import { booleanFromString, locationSchema } from "@/lib/zodValidators";
import { BrazilianStates, Image, Location } from "@prisma/client";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { addPolygon } from "@serverOnly/geometries";
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
  prevState: { responseInfo: APIResponseInfo },
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
      name: formData.get("name"),
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
    const locationId = z.coerce.number().parse(formData.get("locationId"));
    if (!locationId) {
      throw new Error("Invalid id");
    }
    const hasEditedImage = booleanFromString.parse(
      formData.get("hasEditedImage"),
    );
    try {
      let image: Image | null = null;
      if (hasEditedImage) {
        const dbLocation = await prisma.location.findUnique({
          where: {
            id: locationId,
          },
          select: {
            mainImage: {
              select: {
                fileUid: true,
              },
            },
          },
        });
        if (dbLocation?.mainImage) {
          await deleteImage(dbLocation.mainImage.fileUid);
        }
        const formImage = formData.get("mainImage") as File | null;
        if (formImage) {
          image = await uploadImage(formImage);
        }
      }
      let locationName = locationData.name;
      await prisma.$transaction(async (prisma) => {
        const location = await prisma.location.update({
          data: {
            ...locationData,
            cityId: locationData.cityId,
            mainImageId: image?.imageId,
          },
          where: {
            id: locationId,
          },
          select: {
            id: true,
            name: true,
          },
        });
        const featuresGeoJson = z
          .string()
          .nullish()
          .parse(formData.get("featuresGeoJson"));
        try {
          if (featuresGeoJson) {
            await addPolygon(featuresGeoJson, location.id, prisma);
          }
        } catch (err) {
          throw new Error("Error inserting polygon into database");
        }
        locationName = location.name;
      });
      revalidateTag("location");
      return {
        responseInfo: {
          statusCode: 200,
          showSuccessCard: true,
          message: `Praça  ${locationName} atualizada!`,
        } as APIResponseInfo,
      };
    } catch (err) {
      console.log(err);
      return {
        responseInfo: {
          statusCode: 500,
          message: "Erro ao atualizar praça!",
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
        message: "Permissão inválida!",
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

    const formImage = formData.get("mainImage") as File | null;
    let image: Image | null = null;
    try {
      if (formImage) {
        image = await uploadImage(formImage);
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
        const featuresGeoJson = z
          .string()
          .nullish()
          .parse(formData.get("featuresGeoJson"));
        try {
          if (featuresGeoJson) {
            await addPolygon(featuresGeoJson, location.id, prisma);
          }
        } catch (err) {
          throw new Error("Error inserting polygon into database");
        }
        locationName = location.name;
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
      console.log(err);
      return {
        responseInfo: {
          statusCode: 500,
          message: "Erro ao registrar praça!",
        } as APIResponseInfo,
      };
    }
  } catch (err) {
    console.log(err);
    return {
      responseInfo: {
        statusCode: 401,
        message: "Dados inválidos!",
      } as APIResponseInfo,
    };
  }
};

const _editLocationPolygon = async ({
  id,
  featuresGeoJson,
}: {
  id: number;
  featuresGeoJson: string;
}) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["PARK_MANAGER"] });
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 401,
        message: "Permissão inválida!",
      } as APIResponseInfo,
    };
  }
  try {
    await addPolygon(featuresGeoJson, id);
    revalidateTag("location");
    return {
      responseInfo: {
        statusCode: 201,
        showSuccessCard: true,
        message: `Praça atualizada!`,
      } as APIResponseInfo,
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao editar praça!",
      } as APIResponseInfo,
    };
  }
};

export {
  _deleteLocation,
  _updateLocation,
  _createLocation,
  _editLocationPolygon,
};

export type { LocationWithCity };
