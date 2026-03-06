"use client";

import CCheckbox from "@/components/ui/cCheckbox";
import CIconChip from "@/components/ui/cIconChip";
import CSwitch from "@/components/ui/cSwtich";
import { TallyDataPersonFilters } from "@/lib/utils/tallyDataVisualization";
import { BooleanPersonProperties } from "@customTypes/tallys/tallys";
import { Activity, AgeGroup, Gender } from "@enums/personCharacteristics";
import { IconHelp } from "@tabler/icons-react";
import React, { useState } from "react";

const DataFilter = ({
  setPersonFilters,
  personFilters,
}: {
  setPersonFilters: React.Dispatch<
    React.SetStateAction<TallyDataPersonFilters>
  >;
  personFilters: TallyDataPersonFilters;
}) => {
  const [checkedNonDefaultBooleanFilters, setCheckedNonDefaultBooleanFilters] =
    useState<(BooleanPersonProperties | "DEFAULT")[]>([]);

  const toggleOption = <T extends string>(
    current: T[],
    value: T,
    checked: boolean,
  ) => {
    if (checked) {
      return current.includes(value) ? current : [...current, value];
    }
    return current.filter((item) => item !== value);
  };

  const handleBooleanFilterChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { checked, value } = e.target;

    if (value === "DEFAULT") {
      if (checked) {
        const nonDefaultChecked = personFilters.booleanConditionsFilter.filter(
          (filter) => filter !== "DEFAULT",
        );
        setCheckedNonDefaultBooleanFilters(nonDefaultChecked);
        setPersonFilters((prev) => ({
          ...prev,
          booleanConditionsFilter: ["DEFAULT"],
        }));
      } else {
        setPersonFilters((prev) => ({
          ...prev,
          booleanConditionsFilter: checkedNonDefaultBooleanFilters,
        }));
      }
      return;
    }

    setPersonFilters((prev) => {
      const currentWithoutDefault = prev.booleanConditionsFilter.filter(
        (filter) => filter !== "DEFAULT",
      );
      return {
        ...prev,
        booleanConditionsFilter: toggleOption(
          currentWithoutDefault,
          value as BooleanPersonProperties,
          checked,
        ),
      };
    });
  };

  const handleGenderFilterChange = (value: Gender, checked: boolean) => {
    setPersonFilters((prev) => ({
      ...prev,
      genders: toggleOption(prev.genders, value, checked),
    }));
  };

  const handleAgeGroupFilterChange = (value: AgeGroup, checked: boolean) => {
    setPersonFilters((prev) => ({
      ...prev,
      ageGroups: toggleOption(prev.ageGroups, value, checked),
    }));
  };

  const handleActivityFilterChange = (value: Activity, checked: boolean) => {
    setPersonFilters((prev) => ({
      ...prev,
      activities: toggleOption(prev.activities, value, checked),
    }));
  };

  const enableNonDefaultCheckboxes =
    !personFilters.booleanConditionsFilter.includes("DEFAULT");

  return (
    <React.Fragment>
      <div className="flex flex-col gap-6 overflow-auto pb-2">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1">
            <h5 className="text-base font-semibold">Condições (acumulativo)</h5>
            <CIconChip
              icon={<IconHelp />}
              tooltip="Selecionar múltiplas condições mostrará dados referentes a pessoas que atendem a todas as condições selecionadas simultaneamente."
            />
          </div>
          <div className="flex items-center">
            <label htmlFor="default" className="mr-1">
              Nenhuma condição específica
            </label>
            <span className="ml-auto">
              <CCheckbox
                id="default"
                value="DEFAULT"
                sx={{ py: 0, pr: 0 }}
                onChange={handleBooleanFilterChange}
                checked={personFilters.booleanConditionsFilter.includes(
                  "DEFAULT",
                )}
              />
            </span>
          </div>

          <div className="flex items-center">
            <span style={{ opacity: enableNonDefaultCheckboxes ? 1 : 0.5 }}>
              <label htmlFor="isTraversing" className="mr-1">
                Pessoas passando pela praça
              </label>
            </span>
            <span className="ml-auto">
              <CCheckbox
                id="isTraversing"
                value="isTraversing"
                sx={{ py: 0, pr: 0 }}
                onChange={handleBooleanFilterChange}
                disabled={!enableNonDefaultCheckboxes}
                checked={personFilters.booleanConditionsFilter.includes(
                  "isTraversing",
                )}
              />
            </span>
          </div>

          <div className="flex items-center">
            <span style={{ opacity: enableNonDefaultCheckboxes ? 1 : 0.5 }}>
              <label htmlFor="isPersonWithImpairment" className="mr-1">
                Pessoas com deficiência
              </label>
            </span>
            <span className="ml-auto">
              <CCheckbox
                id="isPersonWithImpairment"
                value="isPersonWithImpairment"
                sx={{ py: 0, pr: 0 }}
                onChange={handleBooleanFilterChange}
                disabled={!enableNonDefaultCheckboxes}
                checked={personFilters.booleanConditionsFilter.includes(
                  "isPersonWithImpairment",
                )}
              />
            </span>
          </div>

          <div className="flex items-center">
            <span style={{ opacity: enableNonDefaultCheckboxes ? 1 : 0.5 }}>
              <label htmlFor="isInApparentIllicitActivity" className="mr-1">
                Pessoas em aparente atividade ilícita
              </label>
            </span>
            <span className="ml-auto">
              <CCheckbox
                id="isInApparentIllicitActivity"
                value="isInApparentIllicitActivity"
                sx={{ py: 0, pr: 0 }}
                onChange={handleBooleanFilterChange}
                disabled={!enableNonDefaultCheckboxes}
                checked={personFilters.booleanConditionsFilter.includes(
                  "isInApparentIllicitActivity",
                )}
              />
            </span>
          </div>

          <div className="flex items-center">
            <span style={{ opacity: enableNonDefaultCheckboxes ? 1 : 0.5 }}>
              <label htmlFor="isPersonWithoutHousing" className="mr-1">
                Pessoas em situação de rua
              </label>
            </span>
            <span className="ml-auto">
              <CCheckbox
                id="isPersonWithoutHousing"
                value="isPersonWithoutHousing"
                sx={{ py: 0, pr: 0 }}
                onChange={handleBooleanFilterChange}
                disabled={!enableNonDefaultCheckboxes}
                checked={personFilters.booleanConditionsFilter.includes(
                  "isPersonWithoutHousing",
                )}
              />
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h5 className="text-base font-semibold">Gênero</h5>
          <CSwitch
            checked={personFilters.genders.includes(Gender.MALE)}
            label="Homens"
            labelPosition="left"
            onChange={(_, checked) =>
              handleGenderFilterChange(Gender.MALE, checked)
            }
            formControlSx={{ m: 0, justifyContent: "space-between" }}
          />
          <CSwitch
            checked={personFilters.genders.includes(Gender.FEMALE)}
            label="Mulheres"
            labelPosition="left"
            onChange={(_, checked) =>
              handleGenderFilterChange(Gender.FEMALE, checked)
            }
            formControlSx={{ m: 0, justifyContent: "space-between" }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <h5 className="text-base font-semibold">Faixa etária</h5>
          <CSwitch
            checked={personFilters.ageGroups.includes(AgeGroup.ADULT)}
            label="Adultos"
            labelPosition="left"
            onChange={(_, checked) =>
              handleAgeGroupFilterChange(AgeGroup.ADULT, checked)
            }
            formControlSx={{ m: 0, justifyContent: "space-between" }}
          />
          <CSwitch
            checked={personFilters.ageGroups.includes(AgeGroup.ELDERLY)}
            label="Idosos"
            labelPosition="left"
            onChange={(_, checked) =>
              handleAgeGroupFilterChange(AgeGroup.ELDERLY, checked)
            }
            formControlSx={{ m: 0, justifyContent: "space-between" }}
          />
          <CSwitch
            checked={personFilters.ageGroups.includes(AgeGroup.CHILD)}
            label="Crianças"
            labelPosition="left"
            onChange={(_, checked) =>
              handleAgeGroupFilterChange(AgeGroup.CHILD, checked)
            }
            formControlSx={{ m: 0, justifyContent: "space-between" }}
          />
          <CSwitch
            checked={personFilters.ageGroups.includes(AgeGroup.TEEN)}
            label="Jovens"
            labelPosition="left"
            onChange={(_, checked) =>
              handleAgeGroupFilterChange(AgeGroup.TEEN, checked)
            }
            formControlSx={{ m: 0, justifyContent: "space-between" }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <h5 className="text-base font-semibold">Atividade</h5>
          <CSwitch
            checked={personFilters.activities.includes(Activity.SEDENTARY)}
            label="Sedentário"
            labelPosition="left"
            onChange={(_, checked) =>
              handleActivityFilterChange(Activity.SEDENTARY, checked)
            }
            formControlSx={{ m: 0, justifyContent: "space-between" }}
          />
          <CSwitch
            checked={personFilters.activities.includes(Activity.WALKING)}
            label="Caminhando"
            labelPosition="left"
            onChange={(_, checked) =>
              handleActivityFilterChange(Activity.WALKING, checked)
            }
            formControlSx={{ m: 0, justifyContent: "space-between" }}
          />
          <CSwitch
            checked={personFilters.activities.includes(Activity.STRENUOUS)}
            label="Vigoroso"
            labelPosition="left"
            onChange={(_, checked) =>
              handleActivityFilterChange(Activity.STRENUOUS, checked)
            }
            formControlSx={{ m: 0, justifyContent: "space-between" }}
          />
        </div>
      </div>
    </React.Fragment>
  );
};

export { DataFilter };
