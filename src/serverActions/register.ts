"use server";

import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";

import { prisma } from "../lib/prisma";
import { userRegisterSchema } from "../lib/zodValidators";

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
      username: formData.get("username"),
      password: formData.get("password"),
      confirmPassword: formData.get("passwordConfirmation"),
    });
    if (newUser.password !== newUser.confirmPassword) {
      return {
        statusCode: 403,
        errors: [
          {
            message: "Usuário cadastrado via provedor de terceiros",
            element: "div",
          },
        ],
      };
    }

    const hashedPassword = await bcrypt.hash(newUser.password, 10);

    await prisma.user.create({
      data: {
        email: newUser.email,
        name: newUser.name,
        username: newUser.username,
        password: hashedPassword,
      },
    });
    return { statusCode: 201, errors: null };
  } catch (e) {
    console.log(e);
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      const violatedField = (e.meta?.target as string[])?.[0] || "unknown";
      const violatedFieldPt =
        violatedField === "username" ? "nome de usuário" : "e-mail";
      console.log(violatedField);
      //console.log(`Erro de unicidade no campo: ${violatedField}`);
      return {
        statusCode: 409,
        errors: [
          {
            message: `O ${violatedFieldPt} enviado já está em uso no sistema.`,
            element: violatedField,
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
      errors: [{ message: "Um erro desconhecido ocorreu.", element: "div" }],
    };
  }
};

export default register;
