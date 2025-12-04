"use server";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { z } from "zod";

import { prisma } from "../../prisma";
import { APIResponseInfo } from "../../types/backendCalls/APIResponse";
import { checkIfLoggedInUserHasAnyPermission } from "../serverOnly/checkPermission";

export const _saveLocationCategory = async (
  prevState: { responseInfo: APIResponseInfo },
  formData: FormData,
) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["PARK_MANAGER"] });
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 401,
        message: "Sem permissão para criar categorias de praças!",
      },
    };
  }
  let name: string | null = null;
  let categoryId: number | null | undefined = null;
  try {
    name = z.string().trim().max(255).min(1).parse(formData.get("name"));
    categoryId = z.coerce.number().nullish().parse(formData.get("itemId"));
  } catch (e) {
    return {
      responseInfo: { statusCode: 400, message: "" } as APIResponseInfo,
    };
  }

  if (categoryId) {
    try {
      await prisma.locationCategory.update({
        where: {
          id: categoryId,
        },
        data: {
          name,
        },
      });
      return {
        responseInfo: {
          statusCode: 201,
          showSuccessCard: true,
          message: `Categoria ${name} atualizada!`,
        } as APIResponseInfo,
      };
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === "P2002")
          return {
            responseInfo: {
              statusCode: 409,
              message: `Já existe uma categoria de nome ${name}`,
            } as APIResponseInfo,
          };
      }
      return {
        responseInfo: {
          statusCode: 500,
          message: "Erro ao atualizar categoria de praças!",
        } as APIResponseInfo,
      };
    }
  }

  try {
    await prisma.locationCategory.create({
      data: {
        name,
      },
    });
    return {
      responseInfo: {
        statusCode: 201,
        showSuccessCard: true,
        message: `Categoria ${name} criada!`,
      } as APIResponseInfo,
    };
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === "P2002")
        return {
          responseInfo: {
            statusCode: 409,
            message: `Já existe uma categoria de nome ${name}`,
          } as APIResponseInfo,
        };
    }
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao criar categorias de praças!",
      } as APIResponseInfo,
    };
  }
};

export const _deleteLocationCategoryOrType = async (
  prevState:
    | {
        responseInfo: APIResponseInfo;
        data: {
          conflictingItems: {
            cityId: number;
            cityName: string;
            locations: { name: string }[];
          }[];
        } | null;
      }
    | undefined,
  formData: FormData,
) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["PARK_MANAGER"] });
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 401,
        message: "Sem permissão para excluir categorias/tipos de praças!",
      },
      data: null,
    };
  }
  try {
    const itemType = z
      .enum(["CATEGORY", "TYPE"])
      .parse(formData.get("itemType"));
    const itemId = z.coerce.number().parse(formData.get("itemId"));

    if (itemType === "CATEGORY") {
      try {
        const locations = await prisma.location.findMany({
          where: {
            categoryId: itemId,
          },
          select: {
            name: true,
            city: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        if (locations.length > 0) {
          const grouped = Object.values(
            locations.reduce(
              (acc, loc) => {
                const cityName = loc.city.name;
                const cityId = loc.city.id;
                if (!acc[cityId]) {
                  acc[cityId] = {
                    cityName,
                    cityId,
                    locations: [],
                  };
                }

                acc[cityId].locations.push({
                  name: loc.name,
                });

                return acc;
              },
              {} as Record<
                number,
                {
                  cityId: number;
                  cityName: string;
                  locations: { name: string }[];
                }
              >,
            ),
          );
          return {
            responseInfo: {
              statusCode: 403,
              message: "Exites praças registradas com essa categoria!",
            } as APIResponseInfo,
            data: { conflictingItems: grouped },
          };
        }

        const cat = await prisma.locationCategory.delete({
          where: {
            id: itemId,
          },
          select: {
            name: true,
          },
        });
        return {
          responseInfo: {
            statusCode: 200,
            showSuccessCard: true,
            message: `Categoria '${cat.name}' excluída!`,
          } as APIResponseInfo,
          data: null,
        };
      } catch (e) {
        return {
          responseInfo: {
            statusCode: 400,
            message: "Erro ao excluir categoria!",
          } as APIResponseInfo,
          data: null,
        };
      }
    } else if (itemType === "TYPE") {
      try {
        const locations = await prisma.location.findMany({
          where: {
            typeId: itemId,
          },
          select: {
            name: true,
            city: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        if (locations.length > 0) {
          const grouped = Object.values(
            locations.reduce(
              (acc, loc) => {
                const cityName = loc.city.name;
                const cityId = loc.city.id;
                if (!acc[cityId]) {
                  acc[cityId] = {
                    cityName,
                    cityId,
                    locations: [],
                  };
                }

                acc[cityId].locations.push({
                  name: loc.name,
                });

                return acc;
              },
              {} as Record<
                number,
                {
                  cityId: number;
                  cityName: string;
                  locations: { name: string }[];
                }
              >,
            ),
          );
          return {
            responseInfo: {
              statusCode: 403,
              message: "Exites praças registradas com esse tipo!",
            } as APIResponseInfo,
            data: { conflictingItems: grouped },
          };
        }

        const type = await prisma.locationType.delete({
          where: {
            id: itemId,
          },
          select: {
            name: true,
          },
        });
        return {
          responseInfo: {
            statusCode: 200,
            showSuccessCard: true,
            message: `Tipo '${type.name}' excluído!`,
          } as APIResponseInfo,
          data: null,
        };
      } catch (e) {
        return {
          responseInfo: {
            statusCode: 400,
            message: "Erro ao excluir categproa!",
          } as APIResponseInfo,
          data: null,
        };
      }
    }
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 409,
        message: "Dados incorretos!",
      } as APIResponseInfo,
      data: null,
    };
  }
};
