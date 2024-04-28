"use server";

import { prisma } from "@/lib/prisma";
import { noiseType } from "@/lib/zodValidators";

const createNoiseMeasurement = async (
  content: noiseType,
  point: { x: number; y: number },
) => {
  try {
    const createdNoise = await prisma.noise.create({
      data: {
        date: content.date,
        noiseType: content.noiseType,
        soundLevel: content.soundLevel,
        assessment: { connect: { id: content.assessmentId } },
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
