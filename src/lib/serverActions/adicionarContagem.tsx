"use server";

import { prisma } from "@/lib/prisma";

const adicionarContagem = async (localId: number, content: any) => {
  try {
    await prisma.contagem.create({
      data: {
        data: content.data,
        inicio: content.inicio,
        fim: content.fim,
        quantidadeAnimais: content.quantidadeAnimais,
        temperatura: content.temperatura,
        condicaoCeu: content.condicaoCeu,
        local: {
          connect: {
            id: localId,
          },
        },
      },
    });
  } catch (error) {
    console.error(error);
  }
  console.log(localId);
};

export { adicionarContagem };
