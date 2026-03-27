import { PublicFetchTallyDetailsParams } from "@/app/api/public/tallyDetails/route";
import { PublicFetchTallysParams } from "@/app/api/public/tallys/route";
import {
  PublicFetchTallyDetailsResponse,
  PublicFetchTallysResponse,
} from "@/lib/serverFunctions/queries/public/tally";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

export const usePublicFetchTallys = (
  params?: UseFetchAPIParams<PublicFetchTallysResponse>,
) => {
  const url = `/api/public/tallys`;

  return useFetchAPI<PublicFetchTallysResponse, PublicFetchTallysParams>({
    url,
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["tally", "database"] },
    },
  });
};

export const usePublicFetchTallyDetails = (
  params?: UseFetchAPIParams<PublicFetchTallyDetailsResponse>,
) => {
  const url = `/api/public/tallyDetails`;

  return useFetchAPI<
    PublicFetchTallyDetailsResponse,
    PublicFetchTallyDetailsParams
  >({
    url,
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["tally", "database"] },
    },
  });
};
