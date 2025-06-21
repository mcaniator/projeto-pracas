"use server";

import { Role } from "@prisma/client";
import * as crypto from "crypto";

import { InviteOrdersObj } from "../app/admin/users/invites/invitesTable";
import PermissionError from "../errors/permissionError";
import { auth } from "../lib/auth/auth";
import { prisma } from "../lib/prisma";
import { checkIfLoggedInUserHasAnyPermission } from "../serverOnly/checkPermission";
import { emailTransporter } from "../serverOnly/email";

const createInvite = async (email: string, roles: Role[]) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["USER_MANAGER"] });
  } catch (e) {
    return { statusCode: 401, invite: null };
  }
  const token = crypto.randomBytes(32).toString("hex");
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      return { statusCode: 400, invite: null };
    }
    if (process.env.ENABLE_SYSTEM_EMAILS === "true") {
      await emailTransporter.sendMail({
        to: email,
        subject: "Convite para o Projeto Praças",
        html: `<div><h1>Teste</h1><h2>${token}</h2></div>`,
      });
    }

    const invite = await prisma.invite.create({
      data: {
        email,
        token,
        roles,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    });
    return { statusCode: 201, invite: invite };
  } catch (e) {
    return { statusCode: 500, invite: null };
  }
};

const updateInvite = async (inviteToken: string, roles: Role[]) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["USER_MANAGER"] });
  } catch (e) {
    return { statusCode: 401 };
  }
  try {
    if (
      roles.filter((role) => role).length > 0 &&
      !roles.some((role) => role === "PARK_VIEWER" || role === "PARK_MANAGER")
    ) {
      return { statusCode: 400 };
    }
    await prisma.invite.update({
      where: {
        token: inviteToken,
      },
      data: {
        roles,
      },
    });
    return { statusCode: 200 };
  } catch (e) {
    return { statusCode: 500 };
  }
};

const deleteInvite = async (token: string) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["USER_MANAGER"] });
  } catch (e) {
    return { statusCode: 401 };
  }
  try {
    await prisma.invite.delete({
      where: {
        token,
      },
    });
    return { statusCode: 200 };
  } catch (e) {
    return { statusCode: 500 };
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
    await checkIfLoggedInUserHasAnyPermission({ roles: ["USER_MANAGER"] });
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

export { createInvite, getInvites, deleteInvite, updateInvite };
