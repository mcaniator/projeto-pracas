"use server";

import { prisma } from "@/lib/prisma";
import { checkIfLoggedInUserHasAnyPermission } from "@/lib/serverFunctions/serverOnly/checkPermission";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { z } from "zod";

export const _saveAdministrativeUnit = async (
  prevState: {
    responseInfo: APIResponseInfo;
  },
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
    const unitType = z
      .enum(["NARROW", "INTERMEDIATE", "BROAD"])
      .parse(formData.get("unitType"));
    const unitId = z.coerce.number().nullish().parse(formData.get("UnitId"));
    const name = z
      .string()
      .trim()
      .max(255)
      .min(1)
      .parse(formData.get("unitName"));
    const cityId = z.coerce.number().parse(formData.get("cityId"));
    const unitTypeName =
      unitType === "BROAD" ? "ampla"
      : unitType === "INTERMEDIATE" ? "intermediária"
      : "estreita";
    if (unitId) {
      try {
        switch (unitType) {
          case "NARROW":
            await prisma.narrowAdministrativeUnit.update({
              where: {
                id: unitId,
              },
              data: {
                name,
                city: {
                  connect: {
                    id: cityId,
                  },
                },
              },
            });
            break;
          case "INTERMEDIATE":
            await prisma.intermediateAdministrativeUnit.update({
              where: {
                id: unitId,
              },
              data: {
                name,
                city: {
                  connect: {
                    id: cityId,
                  },
                },
              },
            });
            break;
          case "BROAD":
            await prisma.broadAdministrativeUnit.update({
              where: {
                id: unitId,
              },
              data: {
                name,
                city: {
                  connect: {
                    id: cityId,
                  },
                },
              },
            });
            break;
        }

        return {
          responseInfo: {
            statusCode: 201,
            message: `Região administrativa ${unitTypeName} atualizada!`,
            showSuccessCard: true,
          } as APIResponseInfo,
          data: null,
        };
      } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
          if (e.code === "P2002")
            return {
              responseInfo: {
                statusCode: 409,
                message: `Já existe uma região administrativa ${unitTypeName} de nome ${name} para esta cidade!`,
              } as APIResponseInfo,
              data: null,
            };
        }
        return {
          responseInfo: {
            statusCode: 500,
            message: `Erro ao atualizar região administrativa ${unitTypeName}!`,
          } as APIResponseInfo,
          data: null,
        };
      }
    }

    try {
      switch (unitType) {
        case "NARROW":
          await prisma.narrowAdministrativeUnit.create({
            data: {
              name,
              city: {
                connect: {
                  id: cityId,
                },
              },
            },
          });
          break;
        case "INTERMEDIATE":
          await prisma.intermediateAdministrativeUnit.create({
            data: {
              name,
              city: {
                connect: {
                  id: cityId,
                },
              },
            },
          });
          break;
        case "BROAD":
          await prisma.broadAdministrativeUnit.create({
            data: {
              name,
              city: {
                connect: {
                  id: cityId,
                },
              },
            },
          });
          break;
      }

      return {
        responseInfo: {
          statusCode: 201,
          message: `Região administrativa ${unitTypeName} criada!`,
          showSuccessCard: true,
        } as APIResponseInfo,
        data: null,
      };
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === "P2002")
          return {
            responseInfo: {
              statusCode: 409,
              message: `Já existe uma região administrativa ${unitTypeName} de nome ${name} para esta cidade!`,
            } as APIResponseInfo,
            data: null,
          };
      }
      return {
        responseInfo: {
          statusCode: 500,
          message: `Erro ao atualizar região administrativa ${unitTypeName}!`,
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
