"use client";

import LoadingIcon from "@/components/LoadingIcon";
import { useFetchFormStructure } from "@/lib/serverFunctions/apiCalls/form";
import type { fetchFormStructureResponse } from "@/lib/serverFunctions/queries/form";
import PermissionGuard from "@components/auth/permissionGuard";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import ClientV2 from "../[formId]/edit/clientV2";

const EditFormProtectedContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = Number(searchParams.get("formId"));
  const [fetchFormStructure, isLoading] = useFetchFormStructure();
  const [response, setResponse] = useState<fetchFormStructureResponse | null>(
    null,
  );

  useEffect(() => {
    const loadForm = async () => {
      if (!Number.isFinite(formId)) {
        router.replace("/error");
        return;
      }

      const result = await fetchFormStructure({
        params: { formId },
      });
      if (!result.data?.form.formTree) {
        router.replace("/error");
        return;
      }

      setResponse(result.data);
    };

    void loadForm();
  }, [formId, fetchFormStructure, router]);

  if (isLoading || !response?.form.formTree) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingIcon size={128} />
      </div>
    );
  }

  return (
    <PermissionGuard redirect requiresAnyRoleGroups={["FORM"]}>
      <ClientV2
        formId={formId}
        form={response.form}
        dbCalculations={response.calculations}
      />
    </PermissionGuard>
  );
};

const EditFormProtected = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <LoadingIcon size={128} />
        </div>
      }
    >
      <EditFormProtectedContent />
    </Suspense>
  );
};

export default EditFormProtected;
