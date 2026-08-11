import { prisma } from "@/lib/prisma";
import {
  APIRequestData,
  APIResponseInfo,
} from "@/lib/types/backendCalls/APIResponse";
import { deleteImage, uploadImage } from "@/lib/utils/image";
import { booleanFromString, locationSchema } from "@/lib/zodValidators";
import { Image } from "@prisma/client";
import { addPolygon } from "@serverOnly/geometries";
import { z } from "zod";

export const deleteLocationDataSchema = z.instanceof(FormData);
export type DeleteLocationData = z.infer<typeof deleteLocationDataSchema>;

const _deleteLocation = async (
  request: APIRequestData<DeleteLocationData>,
) => {
  const formData = request.data!;
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
      return {
        responseInfo: {
          statusCode: 200,
          message: `Praça ${deletedLocation.name} excluida!`,
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

export const updateLocationDataSchema = z.instanceof(FormData);
export type UpdateLocationData = z.infer<typeof updateLocationDataSchema>;

const _updateLocation = async (
  request: APIRequestData<UpdateLocationData>,
) => {
  const formData = request.data!;
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
      isPublic: formData.get("isPublic"),
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
      return {
        responseInfo: {
          statusCode: 200,
          message: `Praça  ${locationName} atualizada!`,
        } as APIResponseInfo,
      };
    } catch (err) {
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

export const createLocationDataSchema = z.instanceof(FormData);
export type CreateLocationData = z.infer<typeof createLocationDataSchema>;

const _createLocation = async (
  request: APIRequestData<CreateLocationData>,
) => {
  const formData = request.data!;
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
      isPublic: formData.get("isPublic"),
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
      return {
        responseInfo: {
          statusCode: 201,
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

export const editLocationPolygonDataSchema = z.object({
  id: z.coerce.number(),
  featuresGeoJson: z.string(),
});
export type EditLocationPolygonData = z.infer<
  typeof editLocationPolygonDataSchema
>;

const _editLocationPolygon = async (
  request: APIRequestData<EditLocationPolygonData>,
) => {
  const { id, featuresGeoJson } = request.data!;
  try {
    await addPolygon(featuresGeoJson, id);
    return {
      responseInfo: {
        statusCode: 201,
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

export const updateLocationVisibilityDataSchema = z.object({
  id: z.coerce.number(),
  isPublic: z.boolean(),
});
export type UpdateLocationVisibilityData = z.infer<
  typeof updateLocationVisibilityDataSchema
>;

const _updateLocationVisibility = async (
  request: APIRequestData<UpdateLocationVisibilityData>,
) => {
  const { id, isPublic } = request.data!;
  try {
    await prisma.location.update({
      where: {
        id,
      },
      data: {
        isPublic,
      },
    });
    return {
      responseInfo: {
        statusCode: 201,
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
  _updateLocationVisibility,
};
