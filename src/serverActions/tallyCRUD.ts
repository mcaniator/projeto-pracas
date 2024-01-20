"use server";

import { prisma } from "@/lib/prisma";
import { personType, tallyType } from "@/lib/zodValidators";

const createTally = async (content: tallyType) => {
  try {
    await prisma.tally.create({
      data: content,
    });
  } catch (error) {
    return {
      statusCode: 2,
      errorMessage: "Error creating tally",
    };
  }
};

const addPersonToTally = async (content: personType[]) => {
  try {
    await prisma.person.createMany({
      data: content,
    });
  } catch (error) {
    return {
      statusCode: 2,
      errorMessage: "Error creating 1 or more people entries",
    };
  }
};

export { addPersonToTally, createTally };
