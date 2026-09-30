"use client";

import CCircularProgress from "@/components/ui/CCircularProgress";
import { useFetchFormStructure } from "@/lib/serverFunctions/apiCalls/form";
import type { fetchFormStructureResponse } from "@/lib/serverFunctions/queries/form";
import { useEffect, useState } from "react";

import ClientV2 from "./clientV2";

const FormEditor = ({
  formId,
  onSave,
}: {
  formId: number;
  onSave: (finalized: boolean) => void;
}) => {
  const [formStructure, setFormStructure] =
    useState<fetchFormStructureResponse["formStructure"]>();
  const [formNotFound, setFormNotFound] = useState(false);
  const [fetchFormStructure, isLoading] = useFetchFormStructure({
    callbacks: {
      onSuccess: (response) => {
        if (!response.data?.formStructure) {
          setFormNotFound(true);
          return;
        }

        setFormStructure(response.data.formStructure);
        setFormNotFound(false);
      },
      onError: () => {
        setFormStructure(undefined);
        setFormNotFound(true);
      },
    },
  });

  useEffect(() => {
    setFormStructure(undefined);
    setFormNotFound(false);

    if (!Number.isFinite(formId)) {
      setFormNotFound(true);
      return;
    }

    void fetchFormStructure({
      params: { formId },
    });
  }, [formId, fetchFormStructure]);

  if (formNotFound) {
    return (
      <div className="flex h-full items-center justify-center">
        Formulário não encontrado!
      </div>
    );
  }

  if (isLoading || !formStructure) {
    return (
      <div className="flex h-full items-center justify-center">
        <CCircularProgress size={128} />
      </div>
    );
  }

  return <ClientV2 initialFormStructure={formStructure} onSave={onSave} />;
};

export default FormEditor;
