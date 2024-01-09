"use server";

import { prisma } from "@/lib/prisma";

const createNoiseMeasure = async (content: any) => {
  try {
    await prisma.noise.create({
      data: {
        ...content,
      },
    });
  } catch (error) {
    console.error(error);
  }
};

export { createNoiseMeasure };
