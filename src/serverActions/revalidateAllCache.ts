"use server";

import { validateRequest } from "@/lib/lucia";
import { revalidateTag } from "next/cache";

const revalidateAllCache = async () => {
  const { user } = await validateRequest();
  if (user && user.type === "ADMIN") revalidateTag("database");
};

export { revalidateAllCache };
