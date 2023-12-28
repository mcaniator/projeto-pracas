"use server";

import { prisma } from "@/lib/prisma";
import { localType } from "@/lib/zodValidators";

const cadastrarLocal = async (content: localType) => {
  try {
    await prisma.local.create({
      data: content,
    });
  } catch (error) {
    console.log(error);
  }
};

export { cadastrarLocal };
