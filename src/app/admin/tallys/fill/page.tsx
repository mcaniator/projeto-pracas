"use client";

import LoadingIcon from "@/components/LoadingIcon";
import { useFetchOngoingTally } from "@/lib/serverFunctions/apiCalls/tally";
import type { FetchOngoingTallyResponse } from "@/lib/serverFunctions/apiCalls/tally";
import { useRouter } from "next-nprogress-bar";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { TallyInProgressPage } from "../[tallyId]/fill/tallyInProgressPage";

const normalizeOngoingTallyDates = (
  response: FetchOngoingTallyResponse,
): FetchOngoingTallyResponse => {
  if (!response.tally) {
    return response;
  }

  return {
    ...response,
    tally: {
      ...response.tally,
      startDate: new Date(response.tally.startDate),
      endDate: response.tally.endDate ? new Date(response.tally.endDate) : null,
      updatedAt: new Date(response.tally.updatedAt),
    },
  };
};

const FillContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tallyId = Number(searchParams.get("tallyId"));
  const [fetchOngoingTally, isLoading] = useFetchOngoingTally();
  const [response, setResponse] = useState<FetchOngoingTallyResponse | null>(
    null,
  );

  useEffect(() => {
    const loadTally = async () => {
      if (!Number.isFinite(tallyId)) {
        router.replace("/error");
        return;
      }

      const result = await fetchOngoingTally({
        params: { tallyId },
      });
      if (!result.data?.tally) {
        router.replace("/error");
        return;
      }

      setResponse(normalizeOngoingTallyDates(result.data));
    };

    void loadTally();
  }, [tallyId, fetchOngoingTally, router]);

  if (isLoading || !response?.tally) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingIcon size={128} />
      </div>
    );
  }

  return (
    <TallyInProgressPage
      tallyId={tallyId}
      locationName={response.tally.location.name}
      tally={response.tally}
      finalizedTally={response.tally.isFinalized}
    />
  );
};

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <LoadingIcon size={128} />
        </div>
      }
    >
      <FillContent />
    </Suspense>
  );
};

export default Page;
