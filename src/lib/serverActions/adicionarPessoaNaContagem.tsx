"use server";

import { prisma } from "@/lib/prisma";

const adicionarPessoaNaContagem = async (localId: number, contagemId: number, content: any) => {
  try {
    let contagemValida = await prisma.contagem.findMany({
      where: {
        localId: localId,
        id: contagemId,
      },
    });
    console.log(contagemValida);
    if (contagemValida.length == 0) {
      console.log("Esta contagem nao pertence a esta praça!");
      return;
    }

    await prisma.pessoaNoLocal.create({
      data: {
        classificacaoEtaria: content.classificacaoEtaria,
        genero: content.genero,
        atividadeFisica: content.atividadeFisica,
        passando: content.passando,
        pessoaDeficiente: content.pessoaDeficiente,
        atividadeIlicita: content.atividadeIlicita,
        situacaoRua: content.situacaoRua,
        contagem: {
          connect: {
            id: contagemId,
          },
        },
      },
    });
  } catch (error) {
    console.error(error);
  }
  console.log("Contagem id: ", contagemId);
};

export { adicionarPessoaNaContagem };
