"use server";

import { prisma } from "@/lib/prisma";
import { personType, tallyType } from "@/lib/zodValidators";

const createTally = async (content: tallyType) => {
  try {
    await prisma.tally.create({
      data: {
        startDate: content.startDate,
        endDate: content.endDate,
        observer: content.observer,
        tallyGroup: content.tallyGroup,
        animalsAmount: content.animalsAmount,
        temperature: content.temperature,
        weatherCondition: content.weatherCondition,
        groups: content.groups,
        commercialActivities: content.commercialActivities,
        commercialActivitiesDescription:
          content.commercialActivitiesDescription,
        location: {
          connect: { id: content.locationId },
        },
      },
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
    const databasePerson = await prisma.person.upsert({
      where: {
        person_characteristics: person,
      },
      update: {},
      create: person,
    });

    await prisma.tallyPerson.upsert({
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
    });
  } catch (error) {
    return {
      statusCode: 2,
      errorMessage: "Error creating 1 or more people entries",
    };
  }
};

export { addPersonToTally, createTally };
