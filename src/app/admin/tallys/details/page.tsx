"use client";

import Loading from "@/app/admin/loading";
import CCircularProgress from "@/components/ui/CCircularProgress";
import { useFetchTallyDetails } from "@/lib/serverFunctions/apiCalls/tally";
import type { FetchTallyDetailsResponse } from "@/lib/serverFunctions/queries/tally";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import TallyClient from "./tallyClient";

const TallyDetailsContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tallyId = Number(searchParams.get("tallyId"));
  const [tallyDetails, setTallyDetails] = useState<
    FetchTallyDetailsResponse["tallyDetails"] | null
  >(null);
  const [fetchTallyDetails, isLoading] = useFetchTallyDetails();

  useEffect(() => {
    const loadTallyDetails = async () => {
      if (!tallyId) {
        router.replace("/error");
        return;
      }

      const response = await fetchTallyDetails({
        params: { tallyId },
        requestOptions: { cache: "reload" },
      });
      const details = response.data?.tallyDetails;

      if (!details) {
        router.replace("/error");
        return;
      }

      setTallyDetails(details);
    };

    void loadTallyDetails();
  }, [fetchTallyDetails, tallyId, router]);

  if (isLoading || !tallyDetails) return <Loading />;

  return <TallyClient tallyDetails={tallyDetails} />;
};

const TallyDetailsPage = () => (
  <Suspense
    fallback={
      <div className="flex h-full items-center justify-center">
        <CCircularProgress size={128} />
      </div>
    }
  >
    <TallyDetailsContent />
  </Suspense>
);

export default TallyDetailsPage;
