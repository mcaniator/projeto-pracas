"use client";

import { useEffect, useState } from "react";

import { Button } from "../../../../../../../components/button";
import { AssessmentsWithResposes } from "../../../../../../../serverActions/assessmentUtil";
import { AssessmentsWithResponsesList } from "./assessmentsWithResponsesList";
import { FrequencyTable } from "./frequencyTable";

const MainContainer = ({
  assessments,
  assessmentsGeometries,
}: {
  assessments: AssessmentsWithResposes;
  assessmentsGeometries: {
    assessmentId: number;
    questionId: number;
    geometry: string | null;
  }[][];
}) => {
  const [mainContent, setMainContent] = useState<"FREQUENCIES" | "ASSESSMENTS">(
    "FREQUENCIES",
  );
  useEffect(() => {
    window.addEventListener("resize", () => {
      if (window.innerWidth > 1280) setMainContent("FREQUENCIES");
    });
  }, []);
  return (
    <div className="flex h-full w-full flex-col gap-1 rounded-3xl bg-gray-300/30 p-2">
      <div className="inline-flex w-fit gap-1 rounded-xl bg-gray-400/20 py-1 text-white shadow-inner xl:hidden">
        <Button
          variant={"ghost"}
          className={`rounded-xl px-4 py-1 text-sm xl:text-base ${mainContent === "FREQUENCIES" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
          onPress={() => setMainContent("FREQUENCIES")}
        >
          Frequências
        </Button>
        <Button
          variant={"ghost"}
          className={`rounded-xl px-4 py-1 text-sm xl:text-base ${mainContent === "ASSESSMENTS" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
          onPress={() => setMainContent("ASSESSMENTS")}
        >
          Avaliações
        </Button>
      </div>
      {mainContent === "ASSESSMENTS" ?
        <AssessmentsWithResponsesList
          assessments={assessments}
          assessmentsGeometries={assessmentsGeometries}
        />
      : <FrequencyTable assessments={assessments} />}
    </div>
  );
};

export default MainContainer;
