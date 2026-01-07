import TallysClient from "@/app/admin/tallys/tallysClient";
import { Prisma } from "@prisma/client";

import { prisma } from "../../../lib/prisma";

const Tallys = () => {
  const usersPromise = prisma.user.findMany({
    where: {
      username: {
        not: null,
      },
      tally: {
        some: {},
      },
    },
    select: {
      id: true,
      username: true,
    },
  }) as Prisma.PrismaPromise<{ id: string; username: string }[]>; // Assertion for defining username as not null

  return <TallysClient usersPromise={usersPromise} />;
};

export default Tallys;
