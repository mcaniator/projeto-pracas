"use server";

import { Role } from "@prisma/client";
import * as crypto from "crypto";

import { prisma } from "../lib/prisma";

const createInvite = async (email: string, roles: Role[]) => {
  const token = crypto.randomBytes(32).toString("hex");
  try {
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
    console.log(e);
    return;
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
export {
  createInvite,
  checkIfInviteExists,
  getInviteToken,
  getInviteTokenByEmail,
};
