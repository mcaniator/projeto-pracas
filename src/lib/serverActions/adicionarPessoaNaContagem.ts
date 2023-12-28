"use server";

import { prisma } from "@/lib/prisma";
import { pessoaNoLocalType } from "@/lib/zodValidators";

const adicionarPessoaNaContagem = async (localId: number, contagemId: number, content: pessoaNoLocalType) => {
  try {
    const contagemValida = await prisma.contagem.findMany({
      where: {
        localId: localId,
        id: contagemId,
      },
    });
    console.log(contagemValida);

    if (contagemValida.length == 0) console.log("Esta contagem nao pertence a esta praça!");

    await prisma.pessoaNoLocal.create({
      // ! é melhor fazer isso com um nested write ao invés de separar assim
      data: content,
    });
  } catch (error) {
    console.error(error);
  }
  console.log("Contagem id: ", contagemId);
};

export { adicionarPessoaNaContagem };
