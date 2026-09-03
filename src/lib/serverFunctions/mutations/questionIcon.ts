import { prisma } from "@/lib/prisma";
import { SVG, cleanupSVG, resetSVGOrigin, runSVGO } from "@iconify/tools";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import {
  APIRequestData,
  APIResponseInfo,
} from "../../types/backendCalls/APIResponse";

const createCustomDynamicIconDataSchema = z.object({
  name: z.string().trim().min(1),
  svg: z.string().min(1),
  aliases: z.array(z.string().trim().min(1)).default([]),
});

type CreateCustomDynamicIconData = z.infer<
  typeof createCustomDynamicIconDataSchema
>;
type CreateCustomDynamicIconResponse = Awaited<
  ReturnType<typeof createCustomDynamicIcon>
>;

const createCustomDynamicIcon = async (
  request: APIRequestData<CreateCustomDynamicIconData>,
) => {
  const data = request.data;
  if (!data)
    return {
      responseInfo: {
        statusCode: 400,
        message: "Dados inválidos!",
      } as APIResponseInfo,
    };
  const { name, svg } = data;
  const aliases = [...new Set(data.aliases.filter((alias) => alias !== name))];

  if (!name || !svg) {
    return {
      responseInfo: {
        statusCode: 400,
        message: "Dados inválidos!",
      } as APIResponseInfo,
    };
  }

  let icon: ReturnType<SVG["getIcon"]>;
  try {
    const parsedSvg = new SVG(svg);
    cleanupSVG(parsedSvg);
    resetSVGOrigin(parsedSvg);
    runSVGO(parsedSvg);
    icon = parsedSvg.getIcon();
    if (!icon.width || !icon.height) {
      throw new Error();
    }
  } catch (error) {
    return {
      responseInfo: {
        statusCode: 400,
        message: "SVG inválido!",
      } as APIResponseInfo,
    };
  }

  try {
    await prisma.customDynamicIcon.create({
      data: {
        name,
        body: icon.body,
        width: icon.width,
        height: icon.height,
        aliases,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        responseInfo: {
          statusCode: 409,
          message: "Já existe um ícone personalizado com este nome!",
        } as APIResponseInfo,
      };
    }

    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao salvar ícone personalizado!",
      } as APIResponseInfo,
    };
  }

  return {
    responseInfo: {
      statusCode: 200,
      message: "Ícone personalizado criado com sucesso!",
    } as APIResponseInfo,
  };
};

export { createCustomDynamicIcon, createCustomDynamicIconDataSchema };
export type {
  CreateCustomDynamicIconData,
  CreateCustomDynamicIconResponse,
};
