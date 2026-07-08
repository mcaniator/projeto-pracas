"use client";

import LoadingIcon from "@/components/LoadingIcon";
import { useFetchFinalizedTallysDataVisualization } from "@/lib/serverFunctions/apiCalls/tally";
import type { FetchFinalizedTallysDataVisualizationResponse } from "@/lib/serverFunctions/apiCalls/tally";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { TallysDataPage } from "./[selectedTallysIds]/TallysDataPage";

const ResultContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tallyIdsParam = searchParams.get("tallyIds") ?? "";
  const tallyIds = tallyIdsParam.match(/\d+/g)?.map(Number) ?? [];
  const [fetchFinalizedTallys, isLoading] =
    useFetchFinalizedTallysDataVisualization();
  const [response, setResponse] =
    useState<FetchFinalizedTallysDataVisualizationResponse | null>(null);

  useEffect(() => {
    const loadTallys = async () => {
      if (tallyIds.length === 0) {
        router.replace("/error");
        return;
      }

      const result = await fetchFinalizedTallys({
        params: { tallyIds },
      });
      if (!result.data?.tallys?.length) {
        router.replace("/error");
        return;
      }

      setResponse(result.data);
    };

    void loadTallys();
  }, [tallyIdsParam]);

  if (isLoading || !response?.tallys?.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingIcon size={128} />
      </div>
    );
  }

  const complementaryData = response.tallys.reduce(
    (acc, val) => {
      acc.groups += val.groups || 0;
      acc.pets += val.animalsAmount || 0;
      return acc;
    },
    {
      groups: 0,
      pets: 0,
    },
  );

  return (
    <TallysDataPage
      tallys={response.tallys}
      complementaryData={complementaryData}
      locationName={response.locationName ?? ""}
      locationUsableArea={response.usableArea}
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
      <ResultContent />
    </Suspense>
  );
};

export default Page;
