"use client";

import Loading from "@/app/admin/loading";
import CCircularProgress from "@/components/ui/CCircularProgress";
import { useFetchModularTallyDetails } from "@/lib/serverFunctions/apiCalls/modularTally";
import type { FetchModularTallyDetailsResponse } from "@/lib/serverFunctions/queries/modularTally";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import ModularTallyClient from "./modularTallyClient";

const ModularTallyDetailsContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modularTallyId = Number(searchParams.get("modularTallyId"));
  const [modularTallyDetails, setModularTallyDetails] = useState<
    FetchModularTallyDetailsResponse["modularTallyDetails"] | null
  >(null);
  const [fetchModularTallyDetails, isLoading] = useFetchModularTallyDetails();

  useEffect(() => {
    const loadModularTallyDetails = async () => {
      if (!modularTallyId) {
        router.replace("/error");
        return;
      }

      const response = await fetchModularTallyDetails({
        params: { modularTallyId },
        requestOptions: { cache: "reload" },
      });
      const details = response.data?.modularTallyDetails;

      if (!details) {
        router.replace("/error");
        return;
      }

      setModularTallyDetails(details);
    };

    void loadModularTallyDetails();
  }, [fetchModularTallyDetails, modularTallyId, router]);

  if (isLoading || !modularTallyDetails) return <Loading />;

  return <ModularTallyClient modularTallyDetails={modularTallyDetails} />;
};

const ModularTallyDetailsPage = () => (
  <Suspense
    fallback={
      <div className="flex h-full items-center justify-center">
        <CCircularProgress size={128} />
      </div>
    }
  >
    <ModularTallyDetailsContent />
  </Suspense>
);

export default ModularTallyDetailsPage;
