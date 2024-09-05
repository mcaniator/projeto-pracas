"use client";

import { AssessmentsWithResposes } from "@/serverActions/assessmentUtil";
import React from "react";
import { useState } from "react";

import { FrequencyTable } from "./frequencyTable";

const ResponseViewerClient = ({
  locationId,
  formId,
  assessments,
}: {
  locationId: number;
  formId: number;
  assessments: AssessmentsWithResposes;
}) => {
  const [editingEnvioId, setEditingEnvioId] = useState<string | null>(null);

  const handleEditEnvio = (envioId: string | null) => {
    if (envioId === null) return;
    setEditingEnvioId(envioId);
  };

  return (
    <React.Fragment>
      <FrequencyTable assessments={assessments} />

      <div className="flex basis-2/5 flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 shadow-md">
        <h3 className="text-2xl font-semibold">Avaliações</h3>
      </div>
    </React.Fragment>
  );
};

export { ResponseViewerClient };
