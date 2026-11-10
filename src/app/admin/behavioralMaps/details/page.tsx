"use client";

import Loading from "@/app/admin/loading";
import CCircularProgress from "@/components/ui/CCircularProgress";
import { useFetchBehavioralMapDetails } from "@/lib/serverFunctions/apiCalls/behavioralMapProtocol";
import type { FetchBehavioralMapDetailsResponse } from "@/lib/serverFunctions/queries/behavioralMap";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import BehavioralMapClient from "./behavioralMapClient";

type BehavioralMapDetails =
  FetchBehavioralMapDetailsResponse["behavioralMapDetails"];

const BehavioralMapDetailsContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const behavioralMapId = Number(searchParams.get("behavioralMapId"));
  const [details, setDetails] = useState<BehavioralMapDetails | null>(null);
  const [fetchDetails, isLoading] = useFetchBehavioralMapDetails();

  useEffect(() => {
    const loadDetails = async () => {
      if (!behavioralMapId) {
        router.replace("/error");
        return;
      }
      const response = await fetchDetails({
        params: { behavioralMapId },
        requestOptions: { cache: "reload" },
      });
      const mapDetails = response.data?.behavioralMapDetails;
      if (!mapDetails) {
        router.replace("/error");
        return;
      }
      setDetails(mapDetails);
    };
    void loadDetails();
  }, [behavioralMapId, fetchDetails, router]);

  if (isLoading || !details) return <Loading />;
  return <BehavioralMapClient behavioralMapDetails={details} />;
};

const BehavioralMapDetailsPage = () => (
  <Suspense
    fallback={
      <div className="flex h-full items-center justify-center">
        <CCircularProgress size={128} />
      </div>
    }
  >
    <BehavioralMapDetailsContent />
  </Suspense>
);

export default BehavioralMapDetailsPage;
