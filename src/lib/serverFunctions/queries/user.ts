import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import { getSessionUser } from "@auth/userUtil";
import { prisma } from "@lib/prisma";
import { Role } from "@prisma/client";

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
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.id !== userId) return null;
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
    return user;
  } catch (e) {
    return null;
  }
};

const getUserContentAmount = async (userId: string) => {
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

export { getUserAuthInfo, getUserContentAmount };
