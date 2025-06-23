import "server-only";

import { prisma } from "../lib/prisma";

const checkIfInviteExists = async (token: string) => {
  try {
    const invite = await prisma.invite.findUnique({
      where: {
        token,
      },
    });
    return !!invite;
  } catch (e) {
    return false;
  }
};

const getInviteToken = async (token: string, email: string) => {
  try {
    const invite = await prisma.invite.findUnique({
      where: {
        token,
        email,
      },
    });
    return invite;
  } catch (e) {
    return null;
  }
};

export { checkIfInviteExists, getInviteToken };
