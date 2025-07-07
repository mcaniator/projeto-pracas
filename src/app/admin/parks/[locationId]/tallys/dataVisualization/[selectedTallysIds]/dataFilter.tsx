"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { BooleanPersonProperties } from "@customTypes/tallys/tallys";
import React, { useState } from "react";

const DataFilter = ({
  setBooleanConditionsFilter,
  booleanConditionsFilter,
  blackCheckboxBorder,
}: {
  setBooleanConditionsFilter: React.Dispatch<
    React.SetStateAction<(BooleanPersonProperties | "DEFAULT")[]>
  >;

  booleanConditionsFilter: (BooleanPersonProperties | "DEFAULT")[];
  blackCheckboxBorder?: boolean;
}) => {
  const [checkedNonDefaultCheckboxes, setCheckedNonDefaultCheckboxes] =
    useState<(BooleanPersonProperties | "DEFAULT")[]>([]);
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked)
      if (e.target.value === "DEFAULT") {
        setCheckedNonDefaultCheckboxes(booleanConditionsFilter);
        setBooleanConditionsFilter(["DEFAULT"]);
      } else {
        setBooleanConditionsFilter((prev) => [
          ...prev,
          e.target.value as BooleanPersonProperties,
        ]);
      }
    else if (e.target.value === "DEFAULT") {
      setBooleanConditionsFilter(checkedNonDefaultCheckboxes);
    } else {
      setBooleanConditionsFilter((prev) =>
        prev.filter((filter) => filter !== e.target.value),
      );
    }
  };

  const enableNonDefaultCheckboxes =
    !booleanConditionsFilter.includes("DEFAULT");
  return (
    <React.Fragment>
      <div className="flex flex-col gap-5 overflow-auto">
        <div className="flex basis-1/5 flex-col">
          <h3 className="text-xl font-semibold">Pessoas</h3>
          <div className="flex flex-row gap-1">
            <div className="flex flex-col gap-4">
              <div className="flex items-center">
                <span>
                  <label htmlFor="default" className="mr-1">
                    Padrão
                  </label>
                </span>
                <span className="ml-auto">
                  <Checkbox
                    className={
                      blackCheckboxBorder ? "border-black" : "border-white"
                    }
                    id="default"
                    value={"DEFAULT"}
                    onChange={handleFilterChange}
                    checked={booleanConditionsFilter.includes("DEFAULT")}
                  />
                </span>
              </div>
              <div className="flex items-center">
                <span
                  style={{
                    opacity: enableNonDefaultCheckboxes ? 1 : 0,
                  }}
                >
                  <label htmlFor="isTraversing" className="mr-1">
                    Pessoas passando pela praça
                  </label>
                </span>
                <span
                  className="ml-auto"
                  style={{
                    opacity: enableNonDefaultCheckboxes ? 1 : 0,
                  }}
                >
                  <Checkbox
                    className={
                      blackCheckboxBorder ? "border-black" : "border-white"
                    }
                    id="isTraversing"
                    value={"isTraversing"}
                    onChange={handleFilterChange}
                    disabled={!enableNonDefaultCheckboxes}
                    checked={booleanConditionsFilter.includes("isTraversing")}
                  />
                </span>
              </div>
              <div className="flex items-center">
                <span
                  style={{
                    opacity: enableNonDefaultCheckboxes ? 1 : 0,
                  }}
                >
                  <label htmlFor="isPersonWithImpairment" className="mr-1">
                    Pessoas com deficiência
                  </label>
                </span>
                <span
                  className="ml-auto"
                  style={{
                    opacity: enableNonDefaultCheckboxes ? 1 : 0,
                  }}
                >
                  <Checkbox
                    className={
                      blackCheckboxBorder ? "border-black" : "border-white"
                    }
                    id="isPersonWithImpairment"
                    value={"isPersonWithImpairment"}
                    onChange={handleFilterChange}
                    disabled={!enableNonDefaultCheckboxes}
                    checked={booleanConditionsFilter.includes(
                      "isPersonWithImpairment",
                    )}
                  />
                </span>
              </div>

              <div className="flex items-center">
                <span
                  style={{
                    opacity: enableNonDefaultCheckboxes ? 1 : 0,
                  }}
                >
                  <label htmlFor="isInApparentIllicitActivity" className="mr-1">
                    Pessoas em aparente ativ. Ilícita
                  </label>
                </span>
                <span
                  className="ml-auto"
                  style={{
                    opacity: enableNonDefaultCheckboxes ? 1 : 0,
                  }}
                >
                  <Checkbox
                    className={
                      blackCheckboxBorder ? "border-black" : "border-white"
                    }
                    id="isInApparentIllicitActivity"
                    value={"isInApparentIllicitActivity"}
                    onChange={handleFilterChange}
                    checked={booleanConditionsFilter.includes(
                      "isInApparentIllicitActivity",
                    )}
                  />
                </span>
              </div>

              <div className="flex items-center">
                <span
                  style={{
                    opacity: enableNonDefaultCheckboxes ? 1 : 0,
                  }}
                >
                  <label htmlFor="isPersonWithoutHousing" className="mr-1">
                    Pessoas em situação de rua
                  </label>
                </span>
                <span
                  className="ml-auto"
                  style={{
                    opacity: enableNonDefaultCheckboxes ? 1 : 0,
                  }}
                >
                  <Checkbox
                    className={
                      blackCheckboxBorder ? "border-black" : "border-white"
                    }
                    id="isPersonWithoutHousing"
                    value={"isPersonWithoutHousing"}
                    onChange={handleFilterChange}
                    disabled={!enableNonDefaultCheckboxes}
                    checked={booleanConditionsFilter.includes(
                      "isPersonWithoutHousing",
                    )}
                  />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export { DataFilter };
