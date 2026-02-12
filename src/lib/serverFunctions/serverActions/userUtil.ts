"use server";

import { auth } from "@/lib/auth/auth";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import { getSessionUser } from "@auth/userUtil";
import { prisma } from "@lib/prisma";
import { Prisma, Role } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { userUpdateUsernameSchema } from "@zodValidators";
import { ZodError } from "zod";

const _updateUserUsername = async (
  prevState: {
    statusCode: number;
    username: string | null;
    errors:
      | {
          message: string | null;
          element: string | null;
        }[]
      | null;
  } | null,
  formData: FormData,
): Promise<{
  statusCode: number;
  username: string | null;
  errors:
    | {
        message: string | null;
        element: string | null;
      }[]
    | null;
} | null> => {
  try {
    const sessionUser = await getSessionUser();
    const userInfo = userUpdateUsernameSchema.parse({
      userId: formData.get("userId"),
      username: formData.get("username"),
    });
    if (!sessionUser || sessionUser?.id !== userInfo.userId) {
      return { statusCode: 401, username: null, errors: null };
    }
    const user = await prisma.user.update({
      where: {
        id: userInfo.userId,
      },
      data: {
        username: userInfo.username,
      },
      select: {
        username: true,
      },
    });
    return { statusCode: 200, username: user.username, errors: null };
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return {
        statusCode: 409,
        username: null,
        errors: [
          {
            message: `O nome de usuário enviado já está em uso no sistema.`,
            element: "username",
          },
        ],
      };
    }
    if (e instanceof ZodError) {
      return {
        statusCode: 403,
        username: null,
        errors: e.issues.map((issue) => ({
          message: issue.message,
          element: (issue.path[0] as string) ?? null,
        })),
      };
    }
    return {
      statusCode: 500,
      username: null,
      errors: [{ message: "Um erro desconhecido ocorreu.", element: "div" }],
    };
  }
};

const _updateUserRoles = async (userId: string, roles: Role[]) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["USER_MANAGER"] });
  } catch (e) {
    return { statusCode: 401 };
  }
  if (
    roles.filter((role) => role).length > 0 &&
    !roles.some((role) => role === "PARK_VIEWER" || role === "PARK_MANAGER")
  ) {
    return { statusCode: 400 };
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
    return { statusCode: 200 };
  } catch (e) {
    return { statusCode: 500 };
  }
};

export const _updateUserRolesV2 = async ({
  userId,
  roles,
}: {
  userId: string;
  roles: Role[];
}) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["USER_MANAGER"] });
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 401,
        message: "Sem permissão para atualizar o perfil de usuários!",
      } as APIResponseInfo,
    };
  }

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
        showSuccessCard: true,
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

const _deleteUser = async (userId: string) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["USER_MANAGER"] });
  } catch (e) {
    return { statusCode: 401, type: null };
  }
  try {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
    return { statusCode: 200, type: "DELETE" };
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      try {
        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            active: false,
          },
        });
        return { statusCode: 200, type: "DEACTIVATE" };
      } catch (e) {
        return { statusCode: 500, type: null };
      }
    }
    return { statusCode: 500, type: null };
  }
};

const _getUserContentAmount = async (userId: string) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["USER"] });
  } catch (e) {
    return { statusCode: 401, assessments: null, tallys: null };
  }
  try {
    const [assessments, tallys] = await Promise.all([
      prisma.assessment.count({
        where: {
          userId,
        },
      }),
      prisma.tally.count({
        where: {
          userId,
        },
      }),
    ]);
    return { statusCode: 200, assessments, tallys };
  } catch (e) {
    return { statusCode: 500, assessments: null, tallys: null };
  }
};

export const _userArchiveUpdate = async (params: {
  userId: string;
  active: boolean;
}) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["USER_MANAGER"] });
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 401,
        message: "Sem permissão para atualizar o perfil de usuários!",
      },
    };
  }
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
        showSuccessCard: true,
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

export {
  _updateUserUsername,
  _updateUserRoles,
  _deleteUser,
  _getUserContentAmount,
};
