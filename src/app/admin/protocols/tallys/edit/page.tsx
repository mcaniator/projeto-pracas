"use client";

import CCircularProgress from "@/components/ui/CCircularProgress";
import { useFetchTallyProtocolStructure } from "@/lib/serverFunctions/apiCalls/tally";
import PermissionGuard from "@components/auth/permissionGuard";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import TallyProtocolClient from "./client";

const EditTallyProtocolProtectedContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tallyProtocolId = Number(
    searchParams.get("tallyProtocolId"),
  );
  const [fetchTallyProtocolStructure, isLoading] =
    useFetchTallyProtocolStructure();
  const [response, setResponse] = useState<Awaited<
    ReturnType<typeof fetchTallyProtocolStructure>
  >["data"] | null>(null);

  useEffect(() => {
    if (!Number.isFinite(tallyProtocolId)) {
      router.replace("/error");
      return;
    }

    const loadTallyProtocol = async () => {
      const result = await fetchTallyProtocolStructure({
        params: { tallyProtocolId },
      });
      if (!result.data?.tallyProtocol) {
        router.replace("/error");
        return;
      }
      setResponse(result.data);
    };

    void loadTallyProtocol();
  }, [
    fetchTallyProtocolStructure,
    tallyProtocolId,
    router,
  ]);

  if (isLoading || !response?.tallyProtocol) {
    return (
      <div className="flex h-full items-center justify-center">
        <CCircularProgress size={128} />
      </div>
    );
  }

  return (
    <PermissionGuard redirect requiresAnyRoleGroups={["TALLY"]}>
      <TallyProtocolClient tallyProtocol={response.tallyProtocol} />
    </PermissionGuard>
  );
};

const EditTallyProtocolPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <CCircularProgress size={128} />
        </div>
      }
    >
      <EditTallyProtocolProtectedContent />
    </Suspense>
  );
};

export default EditTallyProtocolPage;
