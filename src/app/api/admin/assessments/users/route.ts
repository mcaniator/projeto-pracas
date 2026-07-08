import { prisma } from "@/lib/prisma";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";

export async function GET() {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["ASSESSMENT"] });
  } catch (e) {
    return new Response("Unauthorized", { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: {
      assessment: {
        some: {},
      },
    },
    select: {
      id: true,
      username: true,
    },
  });

  return Response.json({
    responseInfo: { statusCode: 200 },
    data: { users },
  });
}
