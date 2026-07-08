import { signIn } from "@auth/auth";
import { prisma } from "@lib/prisma";
import { Prisma } from "@prisma/client";
import { getInviteToken } from "@serverOnly/invite";
import { userRegisterSchema } from "@zodValidators";
import bcrypt from "bcryptjs";
import { ZodError, z } from "zod";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const newUser = userRegisterSchema.parse({
      email: formData.get("email"),
      name: formData.get("name"),
      username: formData.get("username"),
      password: formData.get("password"),
      confirmPassword: formData.get("passwordConfirmation"),
    });
    const inviteToken = z.string().parse(formData.get("inviteToken"));

    if (newUser.password !== newUser.confirmPassword) {
      return Response.json({
        responseInfo: { statusCode: 403 },
        data: {
          errors: [
            {
              message: "As senhas nao coincidem.",
              element: "confirmPassword",
            },
          ],
        },
      });
    }

    const invite = await getInviteToken(inviteToken, newUser.email);
    if (!invite) {
      return Response.json({
        responseInfo: { statusCode: 404 },
        data: {
          errors: [
            {
              message: "O e-mail fornecido nao corresponde ao convite!",
              element: "helperCard",
            },
          ],
        },
      });
    }

    const hashedPassword = await bcrypt.hash(newUser.password, 10);

    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          email: newUser.email,
          name: newUser.name,
          password: hashedPassword,
          roles: invite.roles,
          username: newUser.username,
        },
      });

      await tx.invite.delete({
        where: {
          id: invite.id,
        },
      });
    });

    await signIn("credentials", {
      email: newUser.email,
      password: newUser.password,
      redirect: false,
    });

    return Response.json({
      responseInfo: { statusCode: 201 },
      data: { errors: null },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return Response.json({
        responseInfo: { statusCode: 409 },
        data: {
          errors: [
            {
              message: "O e-mail enviado ja esta em uso no sistema.",
              element: "email",
            },
          ],
        },
      });
    }

    if (e instanceof ZodError) {
      return Response.json({
        responseInfo: { statusCode: 403 },
        data: {
          errors: e.issues.map((issue) => ({
            message: issue.message,
            element: (issue.path[0] as string) ?? null,
          })),
        },
      });
    }

    return Response.json({
      responseInfo: { statusCode: 500 },
      data: {
        errors: [{ message: "Um erro desconhecido ocorreu.", element: null }],
      },
    });
  }
}
