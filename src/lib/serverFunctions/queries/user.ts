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

export { getUserAuthInfo };
