"use server";

import { prisma } from "@/lib/prisma";
import { personType, tallyType } from "@/lib/zodValidators";

const createTally = async (content: tallyType, people: personType[]) => {
  try {
    await prisma.tally.create({
      data: {
        ...content,
        people: {
          createMany: { data: people },
        },
      },
    });
  } catch (error) {
    console.error(error);
  }
};

const addPersonToTally = async (content: personType) => {
  try {
    await prisma.person.create({
      data: content,
    });
  } catch (error) {
    console.error(error);
  }
};

export { addPersonToTally, createTally };
