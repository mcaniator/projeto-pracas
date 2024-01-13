"use server";

import { prisma } from "@/lib/prisma";
import { noiseType, pointType } from "@/lib/zodValidators";

const createNoiseMeasure = async (content: noiseType, point: pointType) => {
  try {
    const createdNoise = await prisma.noise.create({
      data: {
        ...content,
      },
    });
    await prisma.$executeRaw`UPDATE noise
    SET point = point(${point.x},${point.y})
    WHERE  id = ${createdNoise.id};`;
  } catch (error) {
    console.error(error);
  }
};

export { createNoiseMeasure };
