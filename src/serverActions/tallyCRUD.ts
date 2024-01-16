"use server";

import { prisma } from "@/lib/prisma";
import { personType, tallyType } from "@/lib/zodValidators";

const createTally = async (content: tallyType) => {
  try {
    await prisma.tally.create({
      data: content,
    });
  } catch (error) {
    console.error(error);
  }
};

const addPersonToTally = async (tallyId: number, content: personType[]) => {
  try {
    await prisma.person.createMany({
      data: content,
    });
  } catch (error) {
    console.error(error);
  }
};

export { addPersonToTally, createTally };
