import { prisma } from "@lib/prisma";

const getResetPasswordUserByToken = async (token: string) => {
  try {
    const passwordReset = await prisma.passwordReset.findUnique({
      where: {
        token,
      },
      select: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });
    return passwordReset;
  } catch (e) {
    return false;
  }
};

export { getResetPasswordUserByToken };
