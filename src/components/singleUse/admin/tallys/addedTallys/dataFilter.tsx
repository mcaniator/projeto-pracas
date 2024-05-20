"use client";

import { Button } from "@/components/button";
import { Input } from "@/components/ui/input";

const DataFilter = ({
  setAgeGroupFilter,
  setActivityFilter,
  setBooleanConditionsFilter,
  setGenderFilter,
}: {
  setAgeGroupFilter: React.Dispatch<React.SetStateAction<string[]>>;
  setActivityFilter: React.Dispatch<React.SetStateAction<string[]>>;
  setBooleanConditionsFilter: React.Dispatch<React.SetStateAction<string[]>>;
  setGenderFilter: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  return (
    <div className="flex  flex-col gap-5">
      <div className="flex basis-1/5 flex-col">
        <h3 className="text-xl font-semibold">sub-título</h3>
        <div className="flex flex-row gap-1">
          <div className="flex flex-col gap-4">
            <div className="flex items-center">
              <span>
                <label htmlFor="sun" className="mr-1">
                  Pessoas passando pela praça
                </label>
              </span>
              <span className="ml-auto">
                <Input
                  id="sun"
                  type="checkbox"
                  value={"dom."}
                  className="h-4 w-4"
                />
              </span>
            </div>
            <div className="flex items-center">
              <span>
                <label htmlFor="mon" className="mr-1">
                  Pessoas com deficiência
                </label>
              </span>
              <span className="ml-auto">
                <Input
                  id="mon"
                  type="checkbox"
                  value={"seg."}
                  className="h-4 w-4"
                />
              </span>
            </div>

            <div className="flex items-center">
              <span>
                <label htmlFor="tue" className="mr-1">
                  Pessoas em aparente ativ. Ilícita
                </label>
              </span>
              <span className="ml-auto">
                <Input
                  id="tue"
                  type="checkbox"
                  value={"ter."}
                  className="h-4 w-4"
                />
              </span>
            </div>

            <div className="flex items-center">
              <span>
                <label htmlFor="wed" className="mr-1">
                  Pessoas em situação de rua
                </label>
              </span>
              <span className="ml-auto">
                <Input
                  id="wed"
                  type="checkbox"
                  value={"qua."}
                  className="h-4 w-4"
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { DataFilter };
