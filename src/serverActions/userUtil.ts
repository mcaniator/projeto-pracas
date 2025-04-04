import { prisma } from "../lib/prisma";

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
        permission: true,
      },
    });
    return user;
  } catch (e) {
    return null;
  }
};

export { getAccountByUserId, getUserById };
