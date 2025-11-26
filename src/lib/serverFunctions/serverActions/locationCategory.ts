"use server";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { z } from "zod";

import { prisma } from "../../prisma";
import { APIResponseInfo } from "../../types/backendCalls/APIResponse";
import { checkIfLoggedInUserHasAnyPermission } from "../serverOnly/checkPermission";

export const _createLocationCategory = async (
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
  try {
    name = z.string().trim().max(255).min(1).parse(formData.get("name"));
  } catch (e) {
    return {
      responseInfo: { statusCode: 400, message: "" } as APIResponseInfo,
    };
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
        statusCode: 401,
        message: "Sem permissão para criar categorias de praças!",
      } as APIResponseInfo,
    };
  }
};
