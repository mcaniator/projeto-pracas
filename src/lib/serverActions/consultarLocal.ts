"use server";

import { prisma } from "@/lib/prisma";

const consultarLocal = async (id: number) => {
  try {
    const pracaConsultada = await prisma.local.findUnique({
      where: {
        id: id,
      },
    });
    console.log(pracaConsultada);
  } catch (error) {
    console.log(error);
  }
};

export { consultarLocal };
