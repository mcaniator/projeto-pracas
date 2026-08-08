import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { z } from "zod";

import { prisma } from "../../prisma";
import { APIResponseInfo } from "../../types/backendCalls/APIResponse";

export const saveLocationTypeDataSchema = z.instanceof(FormData);

export type SaveLocationTypeData = z.infer<typeof saveLocationTypeDataSchema>;

export const _saveLocationType = async (formData: SaveLocationTypeData) => {
  let name: string | null = null;
  let typeId: number | null | undefined = null;
  try {
    name = z.string().trim().max(255).min(1).parse(formData.get("name"));
    typeId = z.coerce.number().nullish().parse(formData.get("itemId"));
  } catch (e) {
    return {
      responseInfo: { statusCode: 400, message: "" } as APIResponseInfo,
    };
  }

  if (typeId) {
    try {
      await prisma.locationType.update({
        where: {
          id: typeId,
        },
        data: {
          name,
        },
      });
      return {
        responseInfo: {
          statusCode: 201,
          message: `Tipo ${name} atualizado!`,
        } as APIResponseInfo,
      };
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === "P2002")
          return {
            responseInfo: {
              statusCode: 409,
              message: `Já existe um tipo de nome ${name}`,
            } as APIResponseInfo,
          };
      }
      return {
        responseInfo: {
          statusCode: 500,
          message: "Erro ao atualizar tipo de praças!",
        } as APIResponseInfo,
      };
    }
  }

  try {
    await prisma.locationType.create({
      data: {
        name,
      },
    });
    return {
      responseInfo: {
        statusCode: 201,
        message: `Tipo ${name} criado!`,
      } as APIResponseInfo,
    };
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === "P2002")
        return {
          responseInfo: {
            statusCode: 409,
            message: `Já existe um tipo de nome ${name}`,
          } as APIResponseInfo,
        };
    }
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao criar tipo de praças!",
      } as APIResponseInfo,
    };
  }
};
