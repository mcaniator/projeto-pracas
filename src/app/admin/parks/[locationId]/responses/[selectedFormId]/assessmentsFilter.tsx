"use client";

import { Button } from "@/components/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { FinalizedAssessmentsList } from "@/serverActions/assessmentUtil";
import { IconFilter } from "@tabler/icons-react";
import Link from "next/link";
import React from "react";

const AssessmentsFilter = ({
  locationId,
  formId,
  filteredAssessments,
  handleWeekdayChange,
  handleInitialDateChange,
  handleFinalDateChange,
}: {
  locationId: number;
  locationName: string;
  formId: number;
  filteredAssessments: FinalizedAssessmentsList | undefined;
  handleInitialDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFinalDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleWeekdayChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  let filteredAssessmentsIdsString;
  if (filteredAssessments)
    filteredAssessmentsIdsString = `${filteredAssessments.map((assessment) => assessment.id).join("-")}`;
  return (
    <>
      <h4 className={"text-2xl font-semibold"}>
        <IconFilter />
      </h4>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col">
          <div className="flex w-fit flex-wrap gap-6">
            <div className="flex flex-row items-center">
              <label htmlFor="initial-date" className="mr-2">
                De:
              </label>
              <Input
                id="initial-date"
                type="datetime-local"
                onChange={handleInitialDateChange}
              ></Input>
            </div>

            <div className="flex flex-row items-center">
              <label htmlFor="final-date" className="mr-2">
                A:
              </label>
              <Input
                id="final-date"
                type="datetime-local"
                onChange={handleFinalDateChange}
              ></Input>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex">
              <label htmlFor="sun" className="mr-1">
                Dom.
              </label>
              <Checkbox
                id="sun"
                value={"dom."}
                variant={"default"}
                onChange={handleWeekdayChange}
              />
            </div>
            <div className="flex">
              <label htmlFor="mon" className="mr-1">
                Seg.
              </label>
              <Checkbox
                id="mon"
                value={"seg."}
                onChange={handleWeekdayChange}
              />
            </div>

            <div className="flex">
              <label htmlFor="tue" className="mr-1">
                Ter.
              </label>
              <Checkbox
                id="tue"
                value={"ter."}
                onChange={handleWeekdayChange}
              />
            </div>

            <div className="flex">
              <label htmlFor="wed" className="mr-1">
                Qua.
              </label>
              <Checkbox
                id="wed"
                value={"qua."}
                onChange={handleWeekdayChange}
              />
            </div>

            <div className="flex">
              <label htmlFor="thu" className="mr-1">
                Qui.
              </label>
              <Checkbox
                id="thu"
                value={"qui."}
                onChange={handleWeekdayChange}
              />
            </div>

            <div className="flex">
              <label htmlFor="fri" className="mr-1">
                Sex.
              </label>
              <Checkbox
                id="fri"
                value={"sex."}
                onChange={handleWeekdayChange}
              />
            </div>

            <div className="flex">
              <label htmlFor="sat" className="mr-1">
                Sáb.
              </label>
              <Checkbox
                id="sat"
                value={"sáb."}
                onChange={handleWeekdayChange}
              />
            </div>
          </div>
        </div>
        <div className="flex basis-1/5 flex-col">
          <h5 className="text-xl font-semibold">Avaliações Filtradas</h5>
          <div className="flex flex-col gap-1">
            <div className="flex flex-row gap-3">
              <div>
                <Button>
                  <Link
                    href={`/admin/parks/${locationId}/responses/${formId}/${filteredAssessmentsIdsString}`}
                  >
                    Dados somados
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { AssessmentsFilter };
