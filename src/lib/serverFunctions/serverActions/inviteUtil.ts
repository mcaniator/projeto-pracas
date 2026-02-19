"use server";

import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import { prisma } from "@lib/prisma";
import { Role } from "@prisma/client";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { emailTransporter } from "@serverOnly/email";
import { getInviteEmail } from "@serverOnly/renderEmail";
import * as crypto from "crypto";

const _updateInvite = async (inviteToken: string, roles: Role[]) => {
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

const _deleteInvite = async (token: string) => {
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

export const _createInviteV2 = async (params: {
  email: string;
  roles: Role[];
  inviteId?: number;
}) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["USER_MANAGER"] });
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 401,
        message: "Sem permissão para criar convites!",
      } as APIResponseInfo,
    };
  }
  if (params.email.trim().length === 0) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "O email deve ser preenchido!",
      } as APIResponseInfo,
    };
  }
  if (
    params.roles.filter((role) => role).length > 0 &&
    !params.roles.some(
      (role) => role === "PARK_VIEWER" || role === "PARK_MANAGER",
    )
  ) {
    return {
      responseInfo: {
        statusCode: 400,
        message:
          "Usuário com qualquer permissão deve ter também alguma permissão de praças!",
      } as APIResponseInfo,
    };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: params.email,
      },
    });
    if (existingUser) {
      return {
        responseInfo: {
          statusCode: 409,
          message: "Já existe um usuário com este email!",
        } as APIResponseInfo,
      };
    }

    if (!params.inviteId) {
      // CREATION
      const token = crypto.randomBytes(32).toString("hex");

      if (process.env.ENABLE_SYSTEM_EMAILS === "true") {
        const html = await getInviteEmail({
          registerLink: `${process.env.BASE_URL}/auth/register/?inviteToken=${token}`,
        });
        await emailTransporter.sendMail({
          to: params.email,
          subject: "Convite para o Projeto Praças",
          html: html,
        });

        await prisma.invite.create({
          data: {
            email: params.email,
            token,
            roles: params.roles,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          },
        });
      } else {
        await prisma.invite.create({
          data: {
            email: params.email,
            token,
            roles: params.roles,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          },
        });
      }

      return {
        responseInfo: {
          statusCode: 201,
          message: "Convite criado com sucesso!",
        } as APIResponseInfo,
      };
    } else {
      // UPDATE
      const existingInvite = await prisma.invite.findUnique({
        where: {
          id: params.inviteId,
        },
        select: {
          email: true,
          token: true,
        },
      });
      if (!existingInvite) {
        return {
          responseInfo: {
            statusCode: 404,
            message: "Convite não encontrado!",
          } as APIResponseInfo,
        };
      }

      await prisma.invite.update({
        where: {
          id: params.inviteId,
        },
        data: {
          email: params.email,
          roles: params.roles,
        },
      });
      if (
        existingInvite.email !== params.email &&
        process.env.ENABLE_SYSTEM_EMAILS === "true"
      ) {
        const html = await getInviteEmail({
          registerLink: `${process.env.BASE_URL}/auth/register/?inviteToken=${existingInvite.token}`,
        });
        await emailTransporter.sendMail({
          to: params.email,
          subject: "Convite para o Projeto Praças",
          html: html,
        });
      }
      return {
        responseInfo: {
          statusCode: 200,
          message: "Convite atualizado com sucesso!",
        } as APIResponseInfo,
      };
    }
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao criar convite!",
      } as APIResponseInfo,
    };
  }
};

export const _deleteInviteV2 = async (params: { id: number }) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["USER_MANAGER"] });
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 401,
        message: "Sem permissão para excluir convites!",
      } as APIResponseInfo,
    };
  }
  try {
    await prisma.invite.delete({
      where: {
        id: params.id,
      },
    });
    return {
      responseInfo: {
        statusCode: 200,
        message: "Convite excluído com sucesso!",
        showSuccessCard: true,
      } as APIResponseInfo,
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao excluir convite!",
      } as APIResponseInfo,
    };
  }
};

export { _deleteInvite, _updateInvite };
