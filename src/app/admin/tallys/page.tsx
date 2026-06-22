import TallysClient from "@/app/admin/tallys/tallysClient";
import { prisma } from "@lib/prisma";

const Tallys = () => {
  const usersPromise = prisma.user.findMany({
    where: {
      tally: {
        some: {},
      },
    },
    select: {
      id: true,
      username: true,
    },
  });

  return <TallysClient usersPromise={usersPromise} />;
};

export default Tallys;
