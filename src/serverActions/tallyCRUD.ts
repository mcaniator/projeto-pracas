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

const addPersonToTally = async (
  tallyId: number,
  quantity: number,
  person: personType,
) => {
  try {
    let databasePerson = await prisma.person.findUnique({
      where: {
        person_characteristics: person,
      },
    });
    if (!databasePerson) {
      databasePerson = await prisma.person.create({
        data: person,
      });
    }

    const databaseTallyPerson = await prisma.tallyPerson.findUnique({
      where: {
        tally_id_person_id: {
          tallyId: tallyId,
          personId: databasePerson.id,
        },
      },
    });
    if (!databaseTallyPerson) {
      await prisma.tallyPerson.create({
        data: {
          tallyId: tallyId,
          personId: databasePerson.id,
          quantity: quantity,
        },
      });
    } else {
      await prisma.tallyPerson.update({
        where: {
          tally_id_person_id: {
            tallyId: tallyId,
            personId: databasePerson.id,
          },
        },
        data: {
          quantity: { increment: quantity },
        },
      });
    }
    /*await prisma.tallyPerson.upsert({
      where: {
        tally_id_person_id: {
          tallyId: tallyId,
          personId: databasePerson.id,
        },
      },
      update: { quantity: { increment: quantity } },
      create: {
        tallyId: tallyId,
        personId: databasePerson.id,
        quantity: quantity,
      },
    });*/
  } catch (error) {
    return {
      statusCode: 2,
      errorMessage: "Error creating 1 or more people entries",
    };
    //console.log(error);
  }
};

export { addPersonToTally, createTally };
