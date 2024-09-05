"use client";

import { FinalizedAssessmentsList } from "@/serverActions/assessmentUtil";
import React, { useRef, useState } from "react";

import { AssessmentsFilter } from "./assessmentsFilter";
import { AssessmentsList } from "./assessmentsList";

type WeekdaysFilterItems =
  | "dom."
  | "seg."
  | "ter."
  | "qua."
  | "qui."
  | "sex."
  | "sáb.";
const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  weekday: "short",
});

const AssessmentsListPage = ({
  locationId,
  locationName,
  formId,
  assessments,
}: {
  locationId: number;
  locationName: string;
  formId: number;
  assessments: FinalizedAssessmentsList;
}) => {
  const weekdaysFilter = useRef<WeekdaysFilterItems[]>([]);
  const initialDateFilter = useRef(0);
  const finalDateFilter = useRef(0);
  const [activeAssessments, setActiveAssessments] = useState(assessments);

  const handleInitialDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    const millisecondsSinceEpoch =
      selectedDate ? new Date(selectedDate).getTime() : null;
    if (millisecondsSinceEpoch)
      initialDateFilter.current = millisecondsSinceEpoch;
    else initialDateFilter.current = 0;
    updateFilteredAssessments();
  };

  const handleFinalDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    const millisecondsSinceEpoch =
      selectedDate ? new Date(selectedDate).getTime() : null;
    if (millisecondsSinceEpoch)
      finalDateFilter.current = millisecondsSinceEpoch;
    else finalDateFilter.current = 0;
    updateFilteredAssessments();
  };

  const handleWeekdayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked)
      weekdaysFilter.current = [
        ...weekdaysFilter.current,
        e.target.value as WeekdaysFilterItems,
      ];
    else
      weekdaysFilter.current = weekdaysFilter.current.filter(
        (day) => day !== e.target.value,
      );
    updateFilteredAssessments();
  };

  const updateFilteredAssessments = () => {
    if (!assessments) {
      return;
    }
    const filteredAssessments = assessments.filter((assessment) => {
      if (weekdaysFilter.current.length > 0) {
        if (
          !weekdaysFilter.current.includes(
            weekdayFormatter.format(
              assessment.startDate,
            ) as WeekdaysFilterItems,
          )
        ) {
          return false;
        }
      }

      if (initialDateFilter.current === 0 && finalDateFilter.current === 0) {
        return true;
      } else if (initialDateFilter.current === 0) {
        if (assessment.startDate.getTime() <= finalDateFilter.current)
          return true;
      } else if (finalDateFilter.current === 0) {
        if (assessment.startDate.getTime() >= initialDateFilter.current)
          return true;
      } else {
        if (
          assessment.startDate.getTime() >= initialDateFilter.current &&
          assessment.startDate.getTime() <= finalDateFilter.current
        ) {
          return true;
        }
      }
    });
    setActiveAssessments(filteredAssessments);
  };
  return (
    <div className={"flex max-h-full min-h-0 flex-col gap-5 p-5"}>
      <div className="flex gap-5 overflow-auto rounded-3xl bg-gray-300/30 p-3 text-white shadow-md">
        <div className={"flex basis-3/5 flex-col gap-1 overflow-auto"}>
          <h3 className={"text-2xl font-semibold"}>
            {`Avaliações finalizadas de ${locationName}`}
          </h3>
          {!assessments || assessments.length === 0 ?
            <h3>Nenhuma avaliação finalizada para este local!</h3>
          : <React.Fragment>
              <div className="flex">
                <span>
                  <h3 className="text-xl font-semibold">Data</h3>
                </span>
                <span className="ml-auto">
                  <h3 className="text-xl font-semibold">{"Avaliador(a)"}</h3>
                </span>
              </div>
              <div className="overflow-auto rounded">
                <AssessmentsList
                  locationId={locationId}
                  formId={formId}
                  assessments={activeAssessments}
                />
              </div>
            </React.Fragment>
          }
        </div>

        <div
          className={
            "flex h-fit w-fit flex-col gap-1 rounded-3xl bg-gray-400/20 p-3 text-white shadow-inner"
          }
        >
          <AssessmentsFilter
            locationId={locationId}
            locationName={locationName}
            formId={formId}
            filteredAssessments={activeAssessments}
            handleWeekdayChange={handleWeekdayChange}
            handleInitialDateChange={handleInitialDateChange}
            handleFinalDateChange={handleFinalDateChange}
          />
        </div>
      </div>
    </div>
  );
};

export { AssessmentsListPage };
