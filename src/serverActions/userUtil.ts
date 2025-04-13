"use server";

import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import { prisma } from "../lib/prisma";
import { userUpdateUsernameSchema } from "../lib/zodValidators";

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
      include: {
        permissions: true,
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

const getUserAuthInfo = async (userId: string | undefined | null) => {
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
        permissions: true,
      },
    });
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

export {
  getAccountByUserId,
  getUserById,
  updateUserUsername,
  getUsernameById,
  getUserAuthInfo,
};
