import { Role } from "@prisma/client";

import { prisma } from "../lib/prisma";

const updateUserRoleAfterUserCreation = async (
  userId: string,
  roles: Role[],
) => {
  try {
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

export { updateUserRoleAfterUserCreation };
