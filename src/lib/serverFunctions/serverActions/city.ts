"use server";

import { BrazilianStates } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { z } from "zod";

import { prisma } from "../../prisma";
import { APIResponseInfo } from "../../types/backendCalls/APIResponse";
import { checkIfLoggedInUserHasAnyPermission } from "../serverOnly/checkPermission";

export const _saveCity = async (
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

  try {
    const parse = {
      name: z.string().trim().max(255).min(1).parse(formData.get("name")),
      state: z.nativeEnum(BrazilianStates).parse(formData.get("state")),
      cityId: z.coerce.number().nullish().parse(formData.get("cityId")),
    };
    if (parse.cityId) {
      try {
        await prisma.city.update({
          where: {
            id: parse.cityId,
          },
          data: {
            name: parse.name,
            state: parse.state,
          },
        });
        return {
          responseInfo: {
            statusCode: 201,
            showSuccessCard: true,
            message: `Cidade ${parse.name} atualizada!`,
          } as APIResponseInfo,
        };
      } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
          if (e.code === "P2002")
            return {
              responseInfo: {
                statusCode: 409,
                message: `Já existe uma cidade de nome ${parse.name}`,
              } as APIResponseInfo,
            };
        }
        return {
          responseInfo: {
            statusCode: 500,
            message: "Erro ao atualizar cidade!",
          } as APIResponseInfo,
        };
      }
    }
    try {
      await prisma.city.create({
        data: {
          name: parse.name,
          state: parse.state,
        },
      });
      return {
        responseInfo: {
          statusCode: 201,
          showSuccessCard: true,
          message: `Cidade ${parse.name} criada!`,
        } as APIResponseInfo,
      };
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === "P2002")
          return {
            responseInfo: {
              statusCode: 409,
              message: `Já existe uma cidade de nome ${parse.name}`,
            } as APIResponseInfo,
          };
      }
      return {
        responseInfo: {
          statusCode: 401,
          message: "Sem permissão para criar cidades!",
        } as APIResponseInfo,
      };
    }
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 400,
        message: "Dados incorretos",
      } as APIResponseInfo,
    };
  }
};

export const _deleteCity = async (
  prevState: {
    responseInfo: APIResponseInfo;
    data: {
      numberOfLocations: number;
    } | null;
  },
  formData: FormData,
) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["PARK_MANAGER"] });
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 401,
        message: "Sem permissão para cadastrar cidades!",
      },
      data: null,
    };
  }

  try {
    const cityId = z.coerce.number().parse(formData.get("cityId"));
    try {
      const locations = await prisma.location.count({
        where: {
          cityId,
        },
      });
      if (locations > 0) {
        return {
          responseInfo: {
            statusCode: 403,
            message: "Exites praças registradas com essa cidade!",
          } as APIResponseInfo,
          data: { numberOfLocations: locations },
        };
      }
      const city = await prisma.city.delete({
        where: {
          id: cityId,
        },
        select: {
          name: true,
        },
      });
      return {
        responseInfo: {
          statusCode: 200,
          showSuccessCard: true,
          message: `Cidade '${city.name}' excluída!`,
        } as APIResponseInfo,
        data: null,
      };
    } catch (e) {
      return {
        responseInfo: {
          statusCode: 400,
          message: "Erro ao excluir cidade!",
        } as APIResponseInfo,
        data: null,
      };
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
