import { prisma } from "@/lib/prisma";
import {
  CUSTOM_DYNAMIC_ICON_MAX_SIZE,
  dynamicIconNameRegex,
} from "@/lib/questionIcons/dynamicIcon";
import { formatFileSize } from "@/lib/utils/file";
import { SVG, cleanupSVG, resetSVGOrigin, runSVGO } from "@iconify/tools";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import {
  APIRequestData,
  APIResponseInfo,
} from "../../types/backendCalls/APIResponse";

const saveCustomDynamicIconDataSchema = z.object({
  name: z.string().trim().min(1),
  svg: z.string().min(1),
  aliases: z.array(z.string().trim().min(1)).default([]),
  iconId: z.coerce.number().int().finite().nonnegative().optional(),
});

type SaveCustomDynamicIconData = z.infer<
  typeof saveCustomDynamicIconDataSchema
>;
type SaveCustomDynamicIconResponse = Awaited<
  ReturnType<typeof saveCustomDynamicIcon>
>;

const saveCustomDynamicIcon = async (
  request: APIRequestData<SaveCustomDynamicIconData>,
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

  if (!name || !svg || !dynamicIconNameRegex.test(name)) {
    return {
      responseInfo: {
        statusCode: 400,
        message: "Dados inválidos!",
      } as APIResponseInfo,
    };
  }
  const svgSize = new Blob([svg]).size;
  if (svgSize > CUSTOM_DYNAMIC_ICON_MAX_SIZE) {
    return {
      responseInfo: {
        statusCode: 400,
        message: `O SVG deve ter no máximo ${formatFileSize(CUSTOM_DYNAMIC_ICON_MAX_SIZE)}.`,
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
    if (data.iconId) {
      await prisma.customDynamicIcon.update({
        where: {
          id: data.iconId,
        },
        data: {
          name,
          body: icon.body,
          width: icon.width,
          height: icon.height,
          sizeInBytes: svgSize,
          aliases,
        },
      });
    } else {
      await prisma.customDynamicIcon.create({
        data: {
          name,
          body: icon.body,
          width: icon.width,
          height: icon.height,
          sizeInBytes: svgSize,
          aliases,
        },
      });
    }
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

const deleteCustomDynamicIconDataSchema = z.object({
  iconId: z.coerce.number().int().positive(),
});

type DeleteCustomDynamicIconData = z.infer<
  typeof deleteCustomDynamicIconDataSchema
>;
type DeleteCustomDynamicIconResponse = Awaited<
  ReturnType<typeof deleteCustomDynamicIcon>
>["data"];

const deleteCustomDynamicIcon = async (
  request: APIRequestData<DeleteCustomDynamicIconData>,
) => {
  const data = request.data;
  if (!data) {
    return {
      responseInfo: {
        statusCode: 400,
        message: "Dados inválidos!",
      } as APIResponseInfo,
    };
  }

  try {
    const customDynamicIcon = await prisma.customDynamicIcon.findUnique({
      where: { id: data.iconId },
      select: { name: true },
    });

    if (!customDynamicIcon) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Ícone personalizado não encontrado!",
        } as APIResponseInfo,
      };
    }

    const questions = await prisma.question.findMany({
      where: {
        iconKey: `custom:${customDynamicIcon.name}`,
      },
      select: { name: true },
      orderBy: { name: "asc" },
    });

    // TODO: consultar outras entidades que utilizem ícones quando elas existirem.
    if (questions.length > 0) {
      return {
        responseInfo: {
          statusCode: 409,
          message:
            "O ícone personalizado não pode ser excluído porque está em uso.",
        } as APIResponseInfo,
        data: {
          questionNames: questions.map((question) => question.name),
        },
      };
    }

    await prisma.customDynamicIcon.delete({
      where: { id: data.iconId },
    });

    return {
      responseInfo: {
        statusCode: 200,
        message: "Ícone personalizado excluído com sucesso!",
      } as APIResponseInfo,
    };
  } catch (error) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao excluir ícone personalizado!",
      } as APIResponseInfo,
    };
  }
};

export {
  deleteCustomDynamicIcon,
  deleteCustomDynamicIconDataSchema,
  saveCustomDynamicIcon,
  saveCustomDynamicIconDataSchema,
};
export type {
  DeleteCustomDynamicIconData,
  DeleteCustomDynamicIconResponse,
  SaveCustomDynamicIconData,
  SaveCustomDynamicIconResponse,
};
