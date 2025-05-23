"use server";

import { Prisma, Role } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ZodError } from "zod";

import { OrdersObj } from "../app/admin/users/usersTable";
import PermissionError from "../errors/permissionError";
import { auth } from "../lib/auth/auth";
import { prisma } from "../lib/prisma";
import { userUpdateUsernameSchema } from "../lib/zodValidators";
import { checkIfHasAnyPermission } from "../serverOnly/checkPermission";

type UserPropertyToSearch = "username" | "email" | "name";

const getAccountByUserId = async (userId: string) => {
  try {
    const account = await prisma.account.findFirst({
      where: {
        userId,
      },
    });
    return account;
  } catch (e) {
    return null;
  }
};

const getUserById = async (userId: string) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
    return user;
  } catch (e) {
    return null;
  }
};

const getUsernameById = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        username: true,
      },
    });
    return user?.username ?? null;
  } catch (e) {
    return null;
  }
};

const getUserAuthInfo = async (
  userId: string | undefined | null,
): Promise<{
  image: string | null;
  id: string;
  email: string;
  username: string | null;
  active: boolean;
  roles: Role[];
} | null> => {
  if (!userId) return null;
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        username: true,
        image: true,
        active: true,
        roles: true,
      },
    });
    /*if (!user || !user.active) {
      return null;
    }*/
    return user;
  } catch (e) {
    return null;
  }
};

const updateUserUsername = async (
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
    const userInfo = userUpdateUsernameSchema.parse({
      userId: formData.get("userId"),
      username: formData.get("username"),
    });
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

const getUsers = async (
  page: number,
  take: number,
  search: string | null,
  orders: OrdersObj,
  activeUsersFilters: boolean,
) => {
  const session = await auth();
  const user = session?.user;
  if (!user) return { statusCode: 401, users: null, totalUsers: null };
  try {
    await checkIfHasAnyPermission(user.id, ["USER_MANAGER"]);
    const skip = (page - 1) * take;
    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        orderBy: Object.keys(orders)
          .filter((key) => orders[key as keyof OrdersObj] !== "none")
          .map((key) => ({ [key]: orders[key as keyof OrdersObj] })),
        where: {
          active: activeUsersFilters,
          ...(search ?
            {
              OR: [
                {
                  email: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  username: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
        },
      }),
      prisma.user.count({
        where: {
          active: activeUsersFilters,
          ...(search ?
            {
              OR: [
                {
                  email: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  username: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
        },
      }),
    ]);
    return {
      statusCode: 200,
      users,
      totalUsers,
    };
  } catch (e) {
    if (e instanceof PermissionError) {
      return { statusCode: 403, users: null, totalUsers: null };
    }
    return { statusCode: 500, users: null, totalUsers: null };
  }
};

const updateUserRoles = async (userId: string, roles: Role[]) => {
  if (
    roles.filter((role) => role).length > 0 &&
    !roles.some(
      (role) =>
        role === "PARK_VIEWER" ||
        role === "PARK_EDITOR" ||
        role === "PARK_MANAGER",
    )
  ) {
    return;
  }
  const session = await auth();
  try {
    await checkIfHasAnyPermission(session?.user.id, ["USER_MANAGER"]);

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        roles: roles,
      },
    });
  } catch (e) {
    return;
  }
};

const deleteUser = async (userId: string) => {
  const session = await auth();
  await checkIfHasAnyPermission(session?.user.id, ["USER_MANAGER"]);
  try {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          active: false,
        },
      });
    }
  }
};

const getUserContentAmount = async (userId: string) => {
  const session = await auth();
  await checkIfHasAnyPermission(session?.user.id, ["USER_MANAGER"]);
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
  return { assessments, tallys };
};

export {
  getAccountByUserId,
  getUserById,
  updateUserUsername,
  getUsernameById,
  getUserAuthInfo,
  getUsers,
  updateUserRoles,
  deleteUser,
  getUserContentAmount,
};

export type { UserPropertyToSearch };
