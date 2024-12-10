"use server";

import { prisma } from "../lib/prisma";

type FetchedCategories = NonNullable<
  Awaited<ReturnType<typeof fetchCategories>>
>;

const fetchCategories = async () => {
  const categories = await prisma.category.findMany({
    include: {
      subcategory: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return categories;
};

export { fetchCategories };
export type { FetchedCategories };
