"use server";

import { Role } from "@prisma/client";
import * as crypto from "crypto";

import { InviteOrdersObj } from "../app/admin/users/invites/invitesTable";
import PermissionError from "../errors/permissionError";
import { auth } from "../lib/auth/auth";
import { prisma } from "../lib/prisma";
import { checkIfHasAnyPermission } from "../serverOnly/checkPermission";

const createInvite = async (email: string, roles: Role[]) => {
  const token = crypto.randomBytes(32).toString("hex");
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      return;
    }
    const invite = await prisma.invite.create({
      data: {
        email,
        token,
        roles,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    });
    return invite;
  } catch (e) {
    return;
  }
};

const updateInvite = async (inviteToken: string, roles: Role[]) => {
  try {
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
    await prisma.invite.update({
      where: {
        token: inviteToken,
      },
      data: {
        roles,
      },
    });
  } catch (e) {
    return;
  }
};

const deleteInvite = async (token: string) => {
  try {
    const invite = await prisma.invite.delete({
      where: {
        token,
      },
    });
    return invite;
  } catch (e) {
    return null;
  }
};

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

const getInviteTokenByEmail = async (email: string) => {
  try {
    const invite = await prisma.invite.findUnique({
      where: {
        email,
      },
    });
    return invite;
  } catch (e) {
    return null;
  }
};

const getInvites = async (
  page: number,
  take: number,
  search: string | null,
  orders: InviteOrdersObj,
) => {
  const session = await auth();
  const user = session?.user;
  if (!user) return { statusCode: 401, invites: null, totalInvites: null };
  try {
    await checkIfHasAnyPermission(user.id, ["USER_MANAGER"]);
    const skip = (page - 1) * take;
    const [invites, totalInvites] = await Promise.all([
      prisma.invite.findMany({
        skip,
        take,
        orderBy: Object.keys(orders)
          .filter((key) => orders[key as keyof InviteOrdersObj] !== "none")
          .map((key) => ({ [key]: orders[key as keyof InviteOrdersObj] })),
        where:
          search ?
            {
              email: {
                contains: search,
                mode: "insensitive",
              },
            }
          : {},
      }),
      prisma.invite.count({
        where:
          search ?
            {
              email: {
                contains: search,
                mode: "insensitive",
              },
            }
          : {},
      }),
    ]);
    return { statusCode: 200, invites, totalInvites };
  } catch (e) {
    if (e instanceof PermissionError) {
      return { statusCode: 403, users: null, totalInvites: null };
    }
    return { statusCode: 500, users: null, totalInvites: null };
  }
};

export {
  createInvite,
  checkIfInviteExists,
  getInviteToken,
  getInviteTokenByEmail,
  getInvites,
  deleteInvite,
  updateInvite,
};
