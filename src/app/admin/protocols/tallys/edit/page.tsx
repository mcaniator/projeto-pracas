"use client";

import CCircularProgress from "@/components/ui/CCircularProgress";
import { useFetchModularTallyTemplateStructure } from "@/lib/serverFunctions/apiCalls/modularTally";
import PermissionGuard from "@components/auth/permissionGuard";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import TallyTemplateClient from "./client";

const EditModularTallyTemplateProtectedContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modularTallyTemplateId = Number(
    searchParams.get("modularTallyTemplateId"),
  );
  const [fetchModularTallyTemplateStructure, isLoading] =
    useFetchModularTallyTemplateStructure();
  const [response, setResponse] = useState<Awaited<
    ReturnType<typeof fetchModularTallyTemplateStructure>
  >["data"] | null>(null);

  useEffect(() => {
    if (!Number.isFinite(modularTallyTemplateId)) {
      router.replace("/error");
      return;
    }

    const loadModularTallyTemplate = async () => {
      const result = await fetchModularTallyTemplateStructure({
        params: { modularTallyTemplateId },
      });
      if (!result.data?.modularTallyTemplate) {
        router.replace("/error");
        return;
      }
      setResponse(result.data);
    };

    void loadModularTallyTemplate();
  }, [
    fetchModularTallyTemplateStructure,
    modularTallyTemplateId,
    router,
  ]);

  if (isLoading || !response?.modularTallyTemplate) {
    return (
      <div className="flex h-full items-center justify-center">
        <CCircularProgress size={128} />
      </div>
    );
  }

  return (
    <PermissionGuard redirect requiresAnyRoleGroups={["TALLY"]}>
      <TallyTemplateClient modularTallyTemplate={response.modularTallyTemplate} />
    </PermissionGuard>
  );
};

const EditModularTallyTemplatePage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <CCircularProgress size={128} />
        </div>
      }
    >
      <EditModularTallyTemplateProtectedContent />
    </Suspense>
  );
};

export default EditModularTallyTemplatePage;
