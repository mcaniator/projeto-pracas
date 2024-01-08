"use server";

import { prisma } from "@/lib/prisma";

const adicionarPessoaNaContagem = async (localId: number, contagemId: number, content: any) => {
  const dataToUpdate: any = {};
  Object.entries(content).forEach(([key, value]) => {
    dataToUpdate[key] = { increment: value };
  });
  //console.log(dataToUpdate);
  try {
    let contagemValida = await prisma.contagem.findMany({
      where: {
        localId: localId,
        id: contagemId,
      },
    });
    //console.log(contagemValida);
    if (contagemValida.length == 0) {
      console.log("Esta contagem nao pertence a esta praça!");
      return;
    }

    await prisma.contagem.update({
      where: {
        id: contagemId,
      },
      data: dataToUpdate,
    });
  } catch (error) {
    console.error(error);
  }
  //console.log("Contagem id: ", contagemId);
};

export { adicionarPessoaNaContagem };
