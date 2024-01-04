"use server";

import { prisma } from "@/lib/prisma";
import { Form } from "@prisma/client";
import { revalidateTag, unstable_cache } from "next/cache";

const handleDelete = async (parkID: number) => {
  try {
    await prisma.local.delete({
      where: {
        id: parkID,
      },
    });
    revalidateTag("local");
  } catch (error) {
    console.error(`Erro ao excluir o local:${parkID}`, error);
  }
};

const fetchLocals = async () => {
  let locals;
  try {
    locals = await prisma.local.findMany({
      select: {
        id: true,
        nome: true,
      },
    });
    return locals;
  } catch (error) {
    console.error(`Erro ao recuperar locais`, error);
    locals = [];
  }
};

const searchLocals = async (name: string) => {
  const cachedLocals = unstable_cache(
    async (name: string) => {
      if (name.length < 2) return [];
      let foundLocals: Form[];
      try {
        foundLocals = await prisma.local.findMany({
          where: {
            nome: {
              contains: name,
              mode: "insensitive",
            },
          },
        });
      } catch (e) {
        console.error(e);
        foundLocals = [];
      }

      return foundLocals;
    },
    ["localUtilCache"],
    { tags: ["local"] },
  );
  return await cachedLocals(name);
};

const revalidate = () => {
  revalidateTag("local");
};

export { handleDelete, fetchLocals, searchLocals, revalidate };
