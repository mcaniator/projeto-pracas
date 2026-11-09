"use client";

import CCircularProgress from "@/components/ui/CCircularProgress";
import { useFetchBehavioralMapProtocolStructure } from "@/lib/serverFunctions/apiCalls/behavioralMapProtocol";
import type { FetchBehavioralMapProtocolStructureResponse } from "@/lib/serverFunctions/queries/behavioralMapProtocolStructure";
import PermissionGuard from "@components/auth/permissionGuard";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import BehavioralMapProtocolClient from "./client";

const EditBehavioralMapProtocolProtectedContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const behavioralMapProtocolId = Number(
    searchParams.get("behavioralMapProtocolId"),
  );
  const [fetchProtocolStructure, isLoading] =
    useFetchBehavioralMapProtocolStructure();
  const [response, setResponse] =
    useState<FetchBehavioralMapProtocolStructureResponse | null>(null);

  useEffect(() => {
    if (!Number.isFinite(behavioralMapProtocolId)) {
      router.replace("/error");
      return;
    }

    const loadProtocol = async () => {
      const result = await fetchProtocolStructure({
        params: { behavioralMapProtocolId },
      });
      if (!result.data?.behavioralMapProtocol) {
        router.replace("/error");
        return;
      }
      setResponse(result.data);
    };

    void loadProtocol();
  }, [fetchProtocolStructure, behavioralMapProtocolId, router]);

  if (isLoading || !response?.behavioralMapProtocol) {
    return (
      <div className="flex h-full items-center justify-center">
        <CCircularProgress size={128} />
      </div>
    );
  }

  return (
    <PermissionGuard redirect requiresAnyRoleGroups={["TALLY"]}>
      <BehavioralMapProtocolClient
        behavioralMapProtocol={response.behavioralMapProtocol}
      />
    </PermissionGuard>
  );
};

const EditBehavioralMapProtocolPage = () => (
  <Suspense
    fallback={
      <div className="flex h-full items-center justify-center">
        <CCircularProgress size={128} />
      </div>
    }
  >
    <EditBehavioralMapProtocolProtectedContent />
  </Suspense>
);

export default EditBehavioralMapProtocolPage;
