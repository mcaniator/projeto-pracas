"use client";

import CCircularProgress from "@/components/ui/CCircularProgress";
import CLinearProgress from "@/components/ui/CLinearProgress";
import FormEditor from "@components/form/formEditor";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const EditFormPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = Number(searchParams.get("formId"));
  const [isRedirecting, setIsRedirecting] = useState(false);

  if (isRedirecting) {
    return <CLinearProgress label="Redirecionando..." />;
  }

  return (
    <FormEditor
      formId={formId}
      onSave={(finalized) => {
        if (!finalized) {
          return;
        }

        setIsRedirecting(true);
        void router.push("/admin/protocols");
      }}
    />
  );
};

const EditFormPage = () => {
  return (
    <div className="h-full p-2">
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center">
            <CCircularProgress size={128} />
          </div>
        }
      >
        <EditFormPageContent />
      </Suspense>
    </div>
  );
};

export default EditFormPage;
