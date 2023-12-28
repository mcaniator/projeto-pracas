"use server";

import { prisma } from "@/lib/prisma";
import { contagemType } from "@/lib/zodValidators";

const adicionarContagem = async (localId: number, content: contagemType) => {
  try {
    await prisma.contagem.create({
      data: content,
    });
  } catch (error) {
    console.error(error);
  }
  console.log(localId);
};

export { adicionarContagem };
