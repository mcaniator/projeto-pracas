"use client";

import CCircularProgress from "@/components/ui/CCircularProgress";
import CLinearProgress from "@/components/ui/CLinearProgress";
import CAdminHeader from "@/components/ui/cAdminHeader";
import FormEditor from "@components/form/formEditor";
import { IconClipboard } from "@tabler/icons-react";
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
      formUse="ASSESSMENT"
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
    <div className="flex h-full min-h-0 flex-col bg-white p-2 text-black">
      <CAdminHeader
        title="Protocolo de avaliação"
        titleIcon={<IconClipboard />}
      />
      <div className="min-h-0 flex-1">
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
    </div>
  );
};

export default EditFormPage;
