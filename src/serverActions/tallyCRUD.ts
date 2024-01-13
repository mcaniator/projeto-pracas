"use server";

import { prisma } from "@/lib/prisma";
import { personType, tallyType } from "@/lib/zodValidators";

const createTally = async (content: tallyType, people: personType[]) => {
  try {
    await prisma.tally.create({
      data: {
        ...content,
      },
    });
  } catch (error) {
    console.error(error);
  }
};

const addPersonToTally = async (locationId: number, tallyId: number, content: personType[]) => {
  /*console.log(locationId);
  console.log(tallyId);
  const dataToUpdate: any = {};
  Object.entries(content).forEach(([key, value]) => {
    dataToUpdate[key] = { increment: value };
  });*/
  //console.log(dataToUpdate);
  try {
    let validTally = await prisma.tally.findMany({
      where: {
        locationId: locationId,
        id: tallyId,
      },
    });
    //console.log(contagemValida);
    if (validTally.length == 0) {
      console.log("Esta contagem nao pertence a esta praça!");
      return;
    }

    await prisma.people.createMany({
      data: content,
    });
  } catch (error) {
    console.error(error);
  }
  //console.log("Contagem id: ", contagemId);
};

export { addPersonToTally, createTally };
