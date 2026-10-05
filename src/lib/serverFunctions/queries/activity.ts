import {
  APIRequest,
  APIResponseInfo,
} from "@/lib/types/backendCalls/APIResponse";

import { getRecentlyCompletedAssessments } from "./assessment";
import { fetchRecentlyCompletedTallys } from "./tally";

export type FetchRecentActivityResponse = NonNullable<
  Awaited<ReturnType<typeof fetchRecentActivity>>
>["data"];

export const fetchRecentActivity = async (_request: APIRequest) => {
  try {
    const [assessments, tallys] = await Promise.all([
      getRecentlyCompletedAssessments(),
      fetchRecentlyCompletedTallys(),
    ]);

    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        assessments: assessments.data.assessments,
        tallys: tallys.data.tallys,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
      } as APIResponseInfo,
      data: null,
    };
  }
};
