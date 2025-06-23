"use server";

import bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { ZodError, z } from "zod";

import { auth, signOut } from "../lib/auth/auth";
import { prisma } from "../lib/prisma";
import { passwordResetSchema } from "../lib/zodValidators";
import { emailTransporter } from "../serverOnly/email";
import { getPasswordResetEmail } from "../serverOnly/renderEmail";

const createPasswordReset = async (
  prevState: { statusCode: number } | null,
  formData: FormData,
) => {
  if (process.env.ENABLE_SYSTEM_EMAILS === "false") {
    return { statusCode: 503 };
  }

  const session = await auth();
  if (session) {
    await signOut({ redirect: false });
  }
  const emailSchema = z.string().email();

  const emailResult = emailSchema.safeParse(formData.get("email"));
  if (!emailResult.success) {
    return { statusCode: 400 };
  }

  try {
    const registeredUser = await prisma.user.findUnique({
      where: {
        email: emailResult.data,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!registeredUser) {
      return { statusCode: 201 };
    }

    const existingToken = await prisma.passwordReset.findUnique({
      where: {
        userId: registeredUser.id,
      },
      select: {
        expiresAt: true,
      },
    });

    if (existingToken) {
      if (existingToken.expiresAt.getTime() > new Date().getTime()) {
        return { statusCode: 409 };
      } else {
        await prisma.passwordReset.delete({
          where: {
            userId: registeredUser.id,
          },
        });
      }
    }

    const token = crypto.randomBytes(32).toString("hex");

    await prisma.passwordReset.create({
      data: {
        user: {
          connect: { id: registeredUser.id },
        },
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });

    const html = await getPasswordResetEmail({
      passwordResetLink: `${process.env.BASE_URL}/auth/passwordReset?token=${token}`,
    });

    await emailTransporter.sendMail({
      to: registeredUser.email,
      subject: "Redefinição de senha do Projeto Praças",
      html: html,
    });

    return { statusCode: 201 };
  } catch (e) {
    return { statusCode: 500 };
  }
};

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

const resetPassword = async (
  prevState: { statusCode: number; errorMessage: string | null } | null,
  formData: FormData,
) => {
  try {
    const passwordReset = passwordResetSchema.parse({
      password: formData.get("password"),
      confirmPassword: formData.get("passwordConfirmation"),
      token: formData.get("token"),
    });

    const passwordResetToken = await prisma.passwordReset.findUnique({
      where: {
        token: passwordReset.token,
      },
      select: {
        token: true,
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!passwordResetToken) {
      return { statusCode: 404, errorMessage: "Token inválido!" };
    }

    const hashedPassword = await bcrypt.hash(passwordReset.password, 10);

    await prisma.user.update({
      where: {
        id: passwordResetToken.user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    await prisma.passwordReset.delete({
      where: {
        token: passwordResetToken.token,
      },
    });

    return { statusCode: 200, errorMessage: null };
  } catch (e) {
    if (e instanceof ZodError) {
      return { statusCode: 403, errorMessage: e.issues[0]?.message ?? null };
    }

    return { statusCode: 500, errorMessage: null };
  }
};

export { createPasswordReset, getResetPasswordUserByToken, resetPassword };
