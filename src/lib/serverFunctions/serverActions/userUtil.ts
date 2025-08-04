"use server";

import { getSessionUser } from "@auth/userUtil";
import { prisma } from "@lib/prisma";
import { Prisma, Role } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { userUpdateUsernameSchema } from "@zodValidators";
import { ZodError } from "zod";

type UserPropertyToSearch = "username" | "email" | "name";

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

export {
  _updateUserUsername,
  _updateUserRoles,
  _deleteUser,
  _getUserContentAmount,
};

export type { UserPropertyToSearch };
