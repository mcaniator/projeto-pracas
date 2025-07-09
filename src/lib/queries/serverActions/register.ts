"use server";

import { signIn } from "@auth/auth";
import { prisma } from "@lib/prisma";
import { Prisma } from "@prisma/client";
import { getInviteToken } from "@serverOnly/invite";
import { userRegisterSchema } from "@zodValidators";
import bcrypt from "bcryptjs";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { ZodError, z } from "zod";

const register = async (
  prevState: {
    statusCode: number;
    errors:
      | {
          message: string | null;
          element: string | null;
        }[]
      | null;
  } | null,
  formData: FormData,
): Promise<{
  statusCode: number;
  errors:
    | {
        message: string | null;
        element: string | null;
      }[]
    | null;
} | null> => {
  try {
    const newUser = userRegisterSchema.parse({
      email: formData.get("email"),
      name: formData.get("name"),
      password: formData.get("password"),
      confirmPassword: formData.get("passwordConfirmation"),
    });
    const inviteToken = z
      .string({
        required_error: "O e-mail fornecido não possui acesso ao sistema",
        invalid_type_error: "O e-mail fornecido não possui acesso ao sistema",
      })
      .parse(formData.get("inviteToken"));
    if (newUser.password !== newUser.confirmPassword) {
      return {
        statusCode: 403,
        errors: [
          {
            message: "As senhas não coincidem.",
            element: "confirmPassword",
          },
        ],
      };
    }

    const hashedPassword = await bcrypt.hash(newUser.password, 10);

    const invite = await getInviteToken(inviteToken, newUser.email);

    if (!invite) {
      return {
        statusCode: 404,
        errors: [
          {
            message: "O e-mail fornecido não corresponde ao convite!",
            element: "helperCard",
          },
        ],
      };
    }

    await prisma.$transaction(async (prisma) => {
      await prisma.user.create({
        data: {
          email: newUser.email,
          name: newUser.name,
          password: hashedPassword,
          roles: invite.roles,
        },
      });

      await prisma.invite.delete({
        where: {
          id: invite.id,
        },
      });
    });

    await signIn("credentials", {
      email: newUser.email,
      password: newUser.password,
      redirectTo: "/admin/home",
    });

    return { statusCode: 201, errors: null };
  } catch (e) {
    if (isRedirectError(e)) {
      throw e;
    }
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return {
        statusCode: 409,
        errors: [
          {
            message: `O e-mail enviado já está em uso no sistema.`,
            element: "email",
          },
        ],
      };
    }
    if (e instanceof ZodError) {
      return {
        statusCode: 403,
        errors: e.issues.map((issue) => ({
          message: issue.message,
          element: (issue.path[0] as string) ?? null,
        })),
      };
    }
    return {
      statusCode: 500,
      errors: [{ message: "Um erro desconhecido ocorreu.", element: null }],
    };
  }
};

export default register;
