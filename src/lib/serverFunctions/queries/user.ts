import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import { getSessionUser } from "@auth/userUtil";
import { prisma } from "@lib/prisma";

export type FetchCurrentUserResponse = NonNullable<
  Awaited<ReturnType<typeof fetchCurrentUser>>
>["data"];
export type CurrentUser = NonNullable<FetchCurrentUserResponse["user"]>;
export const fetchCurrentUser = async () => {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return null;
    const user = await prisma.user.findUnique({
      where: {
        id: sessionUser.id,
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
    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        user,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar usuário!",
      } as APIResponseInfo,
      data: {
        user: null,
      },
    };
  }
};

export type FetchUsersResponse = NonNullable<
  Awaited<ReturnType<typeof fetchUsers>>["data"]
>;
export const fetchUsers = async () => {
  try {
    const users = await prisma.user.findMany();
    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        users,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar usuários!",
      } as APIResponseInfo,
      data: {
        users: [],
      },
    };
  }
};
