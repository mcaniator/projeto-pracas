import { prisma } from "@/lib/prisma";

import { ExportClientPage } from "./client";

const Page = async () => {
  const parkNames = await prisma.location.findMany({
    select: { id: true, name: true },
  });
  return <ExportClientPage locations={parkNames} />;
};

export default Page;
