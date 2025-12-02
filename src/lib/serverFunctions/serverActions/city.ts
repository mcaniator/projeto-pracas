"use server";

import { BrazilianStates } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { z } from "zod";

import { prisma } from "../../prisma";
import { APIResponseInfo } from "../../types/backendCalls/APIResponse";
import { checkIfLoggedInUserHasAnyPermission } from "../serverOnly/checkPermission";

export const _createCity = async (
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
    console.log("formDa", formData);
    const parse = {
      name: z.string().trim().max(255).min(1).parse(formData.get("name")),
      state: z.nativeEnum(BrazilianStates).parse(formData.get("state")),
    };
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
