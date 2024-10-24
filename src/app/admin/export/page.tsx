import { validateRequest } from "@/lib/lucia";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

import { ExportClientPage } from "./client";

const Page = async () => {
  const { user } = await validateRequest();
  if (user === null || user.type !== "ADMIN") redirect("/error");
  const parkNames = await prisma.location.findMany({
    select: { id: true, name: true },
  });
  return <ExportClientPage locations={parkNames} />;
};

export default Page;
