"use server";

import { prisma } from "@/lib/prisma";
import { noiseType } from "@/lib/zodValidators";

const createNoiseMeasurement = async (
  content: noiseType,
  assessmentId: number,
  point: { x: number; y: number },
) => {
  try {
    const createdNoise = await prisma.noise.create({
      data: {
        ...content,
        assessment: { connect: { id: assessmentId } },
      },
    });
    await prisma.$executeRaw`UPDATE noise
    SET point = point(${point.x},${point.y})
    WHERE  id = ${createdNoise.id};`;
  } catch (error) {
    return {
      statusCode: 2,
      errorMessage: "Error creating new noise measurement",
    };
  }
};

export { createNoiseMeasurement };
