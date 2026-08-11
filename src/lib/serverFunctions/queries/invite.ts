import { prisma } from "@/lib/prisma";
import {
  APIRequest,
  APIResponseInfo,
} from "@/lib/types/backendCalls/APIResponse";

export type FetchInvitesResponse = NonNullable<
  Awaited<ReturnType<typeof fetchInvites>>["data"]
>;
export const fetchInvites = async (
  _request: APIRequest,
) => {
  try {
    const invites = await prisma.invite.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });
    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: { invites },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao buscar convites",
      } as APIResponseInfo,
      data: { invites: [] },
    };
  }
};
