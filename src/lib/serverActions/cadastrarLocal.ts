"use server";

import { prisma } from "@/lib/prisma";
import { Local } from "@prisma/client";

const cadastrarLocal = async (content: any, delimitacao1: any, delimitacao2: any, delimitacao3: any) => {
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
        delimitacaoAdministrativa1: {
          connectOrCreate: {
            where: {
              nomeDelimitacaoAdministrativa1: delimitacao1,
            },
            create: {
              nomeDelimitacaoAdministrativa1: delimitacao1,
            },
          },
        },
        delimitacaoAdministrativa2: {
          connectOrCreate: {
            where: {
              nomeDelimitacaoAdministrativa2: delimitacao2,
            },
            create: {
              nomeDelimitacaoAdministrativa2: delimitacao2,
            },
          },
        },
        delimitacaoAdministrativa3: {
          connectOrCreate: {
            where: {
              nomeDelimitacaoAdministrativa3: delimitacao3,
            },
            create: {
              nomeDelimitacaoAdministrativa3: delimitacao3,
            },
          },
        },
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export { cadastrarLocal };
