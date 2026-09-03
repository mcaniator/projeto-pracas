import { auth } from "@/lib/auth/auth";
import {
  APIRequestData,
  APIResponseInfo,
} from "@/lib/types/backendCalls/APIResponse";
import { prisma } from "@lib/prisma";
import { Role } from "@prisma/client";
import { z } from "zod";

export const updateUserRolesDataSchema = z.object({
  userId: z.string(),
  roles: z.array(z.nativeEnum(Role)),
});
export type UpdateUserRolesData = z.infer<typeof updateUserRolesDataSchema>;

export const _updateUserRolesV2 = async (
  request: APIRequestData<UpdateUserRolesData>,
) => {
  const { userId, roles } = request.data!;
  if (
    roles.filter((role) => role).length > 0 &&
    !roles.some((role) => role === "PARK_VIEWER" || role === "PARK_MANAGER")
  ) {
    return {
      responseInfo: {
        statusCode: 400,
        message:
          "Usuário com qualquer permissão deve ter também alguma permissão de praças!",
      } as APIResponseInfo,
    };
  }

  const session = await auth();
  const loggedInUserId = session?.user?.id;
  if (loggedInUserId === userId) {
    if (!roles.some((role) => role === "USER_MANAGER")) {
      return {
        responseInfo: {
          statusCode: 400,
          message: "Você não pode alterar sua permissão de usuários!",
        } as APIResponseInfo,
      };
    }
  }
  try {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        roles: roles,
      },
    });
    return {
      responseInfo: {
        statusCode: 200,
        message: "Permissões atualizadas com sucesso!",
      } as APIResponseInfo,
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Um erro desconhecido ocorreu!",
      } as APIResponseInfo,
    };
  }
};

export const updateUserArchiveDataSchema = z.object({
  userId: z.string(),
  active: z.boolean(),
});
export type UpdateUserArchiveData = z.infer<typeof updateUserArchiveDataSchema>;

export const _userArchiveUpdate = async (
  request: APIRequestData<UpdateUserArchiveData>,
) => {
  const params = request.data!;
  try {
    await prisma.user.update({
      where: {
        id: params.userId,
      },
      data: {
        active: params.active,
      },
    });
    return {
      responseInfo: {
        statusCode: 200,
        message:
          params.active ?
            "Usuário ativado com sucesso!"
          : "Usuário desativado com sucesso!",
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message:
          params.active ?
            "Erro ao ativar usuário!"
          : "Erro ao desativar usuário!",
      },
    };
  }
};
