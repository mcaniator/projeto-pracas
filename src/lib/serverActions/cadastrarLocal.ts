"use server";

import { prisma } from "@/lib/prisma";
import { Local } from "@prisma/client";

const cadastrarLocal = async (content: any, delimitacoes: any) => {
  try {
    await prisma.local.create({
      data: {
        nome: content.nome,
        ePraca: content.praca,
        observacoes: content.observacoes,
        anoCriacao: content.anoCriacao,
        anoReforma: content.anoReforma,
        prefeitoCriacao: content.prefeitoCriacao,
        legislacao: content.legislacao,
        areaUtil: content.areaUtil,
        areaPrefeitura: content.areaPrefeitura,
        inclinacao: content.inclinacao,
        inativoNaoLocalizado: content.inativoNaoLocalizado,
        poligonoArea: content.poligonoArea,
        delimitacaoAdministrativa: {
          connectOrCreate: delimitacoes.map((delimitacao: any) => {
            return {
              where: { nomeDelimitacaoAdministrativa: delimitacao },
              create: { nomeDelimitacaoAdministrativa: delimitacao },
            };
          }),
        },
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export { cadastrarLocal };
