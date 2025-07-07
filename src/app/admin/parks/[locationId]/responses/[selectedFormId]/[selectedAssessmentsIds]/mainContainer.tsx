"use client";

import { Button } from "@components/button";
import { AssessmentsWithResposes } from "@serverActions/assessmentUtil";
import { IconListCheck, IconSum } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { AssessmentsWithResponsesList } from "./assessmentsWithResponsesList";
import { FrequencyTable } from "./frequencyTable";

const MainContainer = ({
  assessments,
  locationName,
}: {
  assessments: AssessmentsWithResposes;
  locationName: string;
}) => {
  const [mainContent, setMainContent] = useState<"FREQUENCIES" | "ASSESSMENTS">(
    "ASSESSMENTS",
  );
  useEffect(() => {
    window.addEventListener("resize", () => {
      if (window.innerWidth > 1280) setMainContent("FREQUENCIES");
    });
    if (window.innerWidth > 1280) setMainContent("FREQUENCIES");
  }, []);

  return (
    <div className="flex w-full flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-2">
      <h3 className="flex overflow-auto p-2 text-xl font-semibold md:text-2xl xl:hidden">
        Respostas ao formulario {assessments.assessments[0]?.form.name}{" "}
        referentes à localidade {locationName}
      </h3>
      <div className="inline-flex w-fit gap-1 rounded-xl bg-gray-500/30 py-1 shadow-inner xl:hidden">
        <Button
          variant={"ghost"}
          className={`rounded-xl px-4 py-1 text-sm xl:text-base ${mainContent === "ASSESSMENTS" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
          onPress={() => setMainContent("ASSESSMENTS")}
        >
          <IconListCheck />
        </Button>
        <Button
          variant={"ghost"}
          className={`rounded-xl px-4 py-1 text-sm xl:text-base ${mainContent === "FREQUENCIES" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
          onPress={() => setMainContent("FREQUENCIES")}
        >
          <IconSum />
        </Button>
      </div>
      {mainContent === "ASSESSMENTS" ?
        <AssessmentsWithResponsesList assessments={assessments} />
      : <FrequencyTable assessments={assessments.assessments} />}
    </div>
  );
};

export default MainContainer;
