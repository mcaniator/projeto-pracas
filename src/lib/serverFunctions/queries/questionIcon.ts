import { FetchQuestionIconsParams } from "@/app/api/admin/forms/questionIcons/route";
import { searchQuestionIcons } from "@/lib/questionIcons/questionIconCatalog";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";

export type FetchQuestionIconsResponse = Awaited<
  ReturnType<typeof fetchQuestionIcons>
>["data"];

const fetchQuestionIcons = (params: FetchQuestionIconsParams) => {
  try {
    const icons = searchQuestionIcons({
      query: params.query,
      limit: params.limit,
    });

    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: {
        icons: icons.map((icon) => ({
          key: icon.key,
          iconName: icon.iconName,
          libraryId: icon.libraryId,
          label: icon.label,
        })),
      },
    };
  } catch (error) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar icones!",
      } as APIResponseInfo,
      data: {
        icons: [],
      },
    };
  }
};

export { fetchQuestionIcons };
