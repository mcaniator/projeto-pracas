"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { RadioButton } from "@/components/ui/radioButton";
import React, { useState } from "react";

import {
  BooleanPersonProperties,
  DataTypesInTallyVisualization,
} from "./TallysDataPage";

let enableCheckboxes = true;
const DataFilter = ({
  setBooleanConditionsFilter,
  setDataTypeToShow,
  dataTypeToShow,
  booleanConditionsFilter,
}: {
  setBooleanConditionsFilter: React.Dispatch<
    React.SetStateAction<(BooleanPersonProperties | "DEFAULT")[]>
  >;
  setDataTypeToShow: React.Dispatch<
    React.SetStateAction<DataTypesInTallyVisualization>
  >;
  dataTypeToShow: DataTypesInTallyVisualization;
  booleanConditionsFilter: (BooleanPersonProperties | "DEFAULT")[];
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
  const handleDataTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setDataTypeToShow(e.target.value as DataTypesInTallyVisualization);
      e.target.value === "PERSONS_DATA" ?
        (enableCheckboxes = true)
      : (enableCheckboxes = false);
    }
  };
  const enableNonDefaultCheckboxes =
    !booleanConditionsFilter.includes("DEFAULT");
  return (
    <React.Fragment>
      <div className="flex flex-col gap-5 overflow-auto">
        <div className="flex basis-1/5 flex-col">
          <h3 className="text-xl font-semibold">Mostrar dados:</h3>
          <div className="flex flex-row gap-1">
            <div className="flex flex-row gap-4">
              <div className="flex items-center">
                <span>
                  <label htmlFor="peopleData" className="mr-1">
                    Pessoas
                  </label>
                </span>
                <span className="ml-auto">
                  <RadioButton
                    id="peopleData"
                    value={"PERSONS_DATA"}
                    variant={"default"}
                    onChange={handleDataTypeChange}
                    name={"teste"}
                    defaultChecked={dataTypeToShow === "PERSONS_DATA"}
                  />
                </span>
              </div>
              <div className="flex items-center">
                <span>
                  <label htmlFor="complementaryData" className="mr-1">
                    Dados complementares
                  </label>
                </span>
                <span className="ml-auto">
                  <RadioButton
                    id="complementaryData"
                    value={"COMPLEMENTARY_DATA"}
                    variant={"default"}
                    onChange={handleDataTypeChange}
                    name={"teste"}
                    defaultChecked={dataTypeToShow === "COMPLEMENTARY_DATA"}
                  />
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex basis-1/5 flex-col">
          <h3
            className="text-xl font-semibold"
            style={{ opacity: enableCheckboxes ? 1 : 0 }}
          >
            Pessoas
          </h3>
          <div className="flex flex-row gap-1">
            <div className="flex flex-col gap-4">
              <div className="flex items-center">
                <span style={{ opacity: enableCheckboxes ? 1 : 0 }}>
                  <label htmlFor="default" className="mr-1">
                    Padrão
                  </label>
                </span>
                <span
                  className="ml-auto"
                  style={{ opacity: enableCheckboxes ? 1 : 0 }}
                >
                  <Checkbox
                    id="default"
                    value={"DEFAULT"}
                    onChange={handleFilterChange}
                    disabled={!enableCheckboxes}
                  />
                </span>
              </div>
              <div className="flex items-center">
                <span
                  style={{
                    opacity:
                      enableCheckboxes && enableNonDefaultCheckboxes ? 1 : 0,
                  }}
                >
                  <label htmlFor="isTraversing" className="mr-1">
                    Pessoas passando pela praça
                  </label>
                </span>
                <span
                  className="ml-auto"
                  style={{
                    opacity:
                      enableCheckboxes && enableNonDefaultCheckboxes ? 1 : 0,
                  }}
                >
                  <Checkbox
                    id="isTraversing"
                    value={"isTraversing"}
                    onChange={handleFilterChange}
                    disabled={!enableCheckboxes || !enableNonDefaultCheckboxes}
                  />
                </span>
              </div>
              <div className="flex items-center">
                <span
                  style={{
                    opacity:
                      enableCheckboxes && enableNonDefaultCheckboxes ? 1 : 0,
                  }}
                >
                  <label htmlFor="isPersonWithImpairment" className="mr-1">
                    Pessoas com deficiência
                  </label>
                </span>
                <span
                  className="ml-auto"
                  style={{
                    opacity:
                      enableCheckboxes && enableNonDefaultCheckboxes ? 1 : 0,
                  }}
                >
                  <Checkbox
                    id="isPersonWithImpairment"
                    value={"isPersonWithImpairment"}
                    onChange={handleFilterChange}
                    disabled={!enableCheckboxes || !enableNonDefaultCheckboxes}
                  />
                </span>
              </div>

              <div className="flex items-center">
                <span
                  style={{
                    opacity:
                      enableCheckboxes && enableNonDefaultCheckboxes ? 1 : 0,
                  }}
                >
                  <label htmlFor="isInApparentIllicitActivity" className="mr-1">
                    Pessoas em aparente ativ. Ilícita
                  </label>
                </span>
                <span
                  className="ml-auto"
                  style={{
                    opacity:
                      enableCheckboxes && enableNonDefaultCheckboxes ? 1 : 0,
                  }}
                >
                  <Checkbox
                    id="isInApparentIllicitActivity"
                    value={"isInApparentIllicitActivity"}
                    onChange={handleFilterChange}
                    disabled={!enableCheckboxes || !enableNonDefaultCheckboxes}
                  />
                </span>
              </div>

              <div className="flex items-center">
                <span
                  style={{
                    opacity:
                      enableCheckboxes && enableNonDefaultCheckboxes ? 1 : 0,
                  }}
                >
                  <label htmlFor="isPersonWithoutHousing" className="mr-1">
                    Pessoas em situação de rua
                  </label>
                </span>
                <span
                  className="ml-auto"
                  style={{
                    opacity:
                      enableCheckboxes && enableNonDefaultCheckboxes ? 1 : 0,
                  }}
                >
                  <Checkbox
                    id="isPersonWithoutHousing"
                    value={"isPersonWithoutHousing"}
                    onChange={handleFilterChange}
                    disabled={!enableCheckboxes || !enableNonDefaultCheckboxes}
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
