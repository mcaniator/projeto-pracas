import { prisma } from "@lib/prisma";
import { APIRequestParams } from "@/lib/types/backendCalls/APIResponse";
import { z } from "zod";

export const fetchPasswordResetTokenParamsSchema = z.object({
  token: z.string().min(1),
});
export type FetchPasswordResetTokenParams = z.infer<
  typeof fetchPasswordResetTokenParamsSchema
>;
export type FetchPasswordResetTokenResponse = NonNullable<
  Awaited<ReturnType<typeof fetchPasswordResetToken>>
>["data"];

const fetchPasswordResetToken = async (
  request: APIRequestParams<FetchPasswordResetTokenParams>,
) => {
  const { token } = request.params!;
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
    if (!passwordReset)
      return {
        responseInfo: { statusCode: 404, message: "Token inválido." },
        data: { email: null },
      };
    return {
      responseInfo: { statusCode: 200 },
      data: { email: passwordReset?.user.email ?? null },
    };
  } catch (e) {
    return { responseInfo: { statusCode: 500 }, data: { email: null } };
  }
};

export { fetchPasswordResetToken };
