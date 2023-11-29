"use server";

import { prisma } from "../prisma";

const consultar = async (id: any) => {
  try {
    let pracaConsultada = await prisma.local.findUnique({
      where: {
        id: id,
      },
    });
    console.log(pracaConsultada);
  } catch (error) {
    console.log(error);
  }
};

export { consultar };
