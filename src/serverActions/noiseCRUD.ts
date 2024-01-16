"use server";

import { prisma } from "@/lib/prisma";
import { noiseType } from "@/lib/zodValidators";

const createNoiseMeasurement = async (content: noiseType, point: { x: number; y: number }) => {
  try {
    const createdNoise = await prisma.noise.create({
      data: content,
    });
    await prisma.$executeRaw`UPDATE noise
    SET point = point(${point.x},${point.y})
    WHERE  id = ${createdNoise.id};`;
  } catch (error) {
    console.error(error);
  }
};

export { createNoiseMeasurement };
