"use server";

import { prisma } from "@/lib/prisma";
import { CalculationTypes } from "@prisma/client";

const createCalculationIfNotExists = async (
  type: CalculationTypes,
  name: string,
  categoryId: number,
  subcategoryId: number | null,
  questionsIds: number[],
) => {
  const existingCalculation = await prisma.calculation.findFirst({
    where: {
      type,
      name,
      categoryId,
      subcategoryId,
      questions: {
        every: {
          id: {
            in: questionsIds,
          },
        },
        none: {
          id: {
            notIn: questionsIds,
          },
        },
      },
    },
  });
  if (existingCalculation !== null) {
    return existingCalculation;
  }

  const newCalculation = await prisma.calculation.create({
    data: {
      type,
      name,
      categoryId,
      subcategoryId,
      questions: {
        connect: questionsIds.map((questionId) => ({ id: questionId })),
      },
    },
  });
  return newCalculation;
};

export { createCalculationIfNotExists };
