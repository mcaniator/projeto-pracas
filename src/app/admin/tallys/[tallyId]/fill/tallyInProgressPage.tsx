"use client";

import CommercialActivityCreationDialog from "@/app/admin/tallys/[tallyId]/fill/commercialActivityCreationDialog";
import CounterButtonGroup from "@/app/admin/tallys/[tallyId]/fill/counterButtonGroup";
import { Button } from "@/components/button";
import { useHelperCard } from "@/components/context/helperCardContext";
import CAccordion from "@/components/ui/accordion/CAccordion";
import CAccordionDetails from "@/components/ui/accordion/CAccordionDetails";
import CAccordionSummary from "@/components/ui/accordion/CAccordionSummary";
import CAdminHeader from "@/components/ui/cAdminHeader";
import CAutocomplete from "@/components/ui/cAutoComplete";
import CCheckbox from "@/components/ui/cCheckbox";
import CNumberField from "@/components/ui/cNumberField";
import { weatherNameMap } from "@/lib/translationMaps/tallys";
import {
  ActivityType,
  AgeGroupType,
  GenderType,
} from "@/lib/types/tallys/person";
import { useUserContext } from "@components/context/UserContext";
import { WeatherStats } from "@customTypes/tallys/ongoingTally";
import { checkIfRolesArrayContainsAll } from "@lib/auth/rolesUtil";
import { Paper } from "@mui/material";
import { WeatherConditions } from "@prisma/client";
import {
  IconClipboardData,
  IconMoodDollar,
  IconPlus,
  IconTrashX,
} from "@tabler/icons-react";
import { CommercialActivity, OngoingTally } from "@zodValidators";
import { redirect } from "next/navigation";
import { useState } from "react";
import React from "react";
import { BsPersonStanding, BsPersonStandingDress } from "react-icons/bs";
import { FaPersonRunning, FaPersonWalking } from "react-icons/fa6";
import { GrGroup } from "react-icons/gr";
import { TiWeatherPartlySunny } from "react-icons/ti";

import TallyInProgressReview from "./tallyInProgressReview";
import { TallyInProgressReviewModal } from "./tallyInProgressReviewModal";
import TallyInProgressSaveModal from "./tallyInProgressSaveModal";

interface SubmittingObj {
  submitting: boolean;
  finishing: boolean;
  deleting: boolean;
}

type PersonCharacteristics = {
  FEMALE: {
    activity: ActivityType;
    isTraversing: boolean;
    isPersonWithImpairment: boolean;
    isInApparentIllicitActivity: boolean;
    isPersonWithoutHousing: boolean;
  };
  MALE: {
    activity: ActivityType;
    isTraversing: boolean;
    isPersonWithImpairment: boolean;
    isInApparentIllicitActivity: boolean;
    isPersonWithoutHousing: boolean;
  };
};

const defaultCommercialActivitiesOptions = [
  { value: "Alimentos", label: "Alimentos" },
  { value: "Produtos", label: "Produtos" },
  {
    value: "Pula-pula (ou outra ativ. infantil)",
    label: "Pula-pula (ou outra ativ. infantil)",
  },
  {
    value: "Mesas de bares do entorno",
    label: "Mesas de bares do entorno",
  },
  { value: "Outros", label: "Outros" },
];

const TallyInProgressPage = ({
  tallyId,
  locationId,
  tally,
}: {
  tallyId: number;
  locationId: number;
  tally: OngoingTally;
}) => {
  const { user } = useUserContext();
  if (user.id !== tally.user.id) {
    if (
      !checkIfRolesArrayContainsAll(user.roles, { roles: ["TALLY_MANAGER"] })
    ) {
      redirect("/error");
    }
  }
  const { setHelperCard } = useHelperCard();
  const [
    openCommercialActivityCreationDialog,
    setOpenCommercialActivityCreationDialog,
  ] = useState(false);
  const [submittingObj, setSubmittingObj] = useState<SubmittingObj>({
    submitting: false,
    finishing: false,
    deleting: false,
  });
  const [tallyMap, setTallyMap] = useState<Map<string, number>>(() => {
    const tallyMap = new Map();
    if (tally.tallyPerson) {
      for (const tallyPerson of tally.tallyPerson) {
        const gender = tallyPerson.person.gender;
        const ageGroup = tallyPerson.person.ageGroup;
        const activity = tallyPerson.person.activity;
        const isTraversing = tallyPerson.person.isTraversing;
        const isPersonWithImpairment =
          tallyPerson.person.isPersonWithImpairment;
        const isInApparentIllicitActivity =
          tallyPerson.person.isInApparentIllicitActivity;
        const isPersonWithoutHousing =
          tallyPerson.person.isPersonWithoutHousing;
        tallyMap.set(
          `${gender}-${ageGroup}-${activity}-${isTraversing}-${isPersonWithImpairment}-${isInApparentIllicitActivity}-${isPersonWithoutHousing}`,
          tallyPerson.quantity,
        );
      }
    }

    return tallyMap;
  });
  const [commercialActivities, setCommercialActivities] =
    useState<CommercialActivity>(() => {
      if (tally.commercialActivities) return tally.commercialActivities;
      else return {};
    });
  const [selectedCommercialActivity, setSelectedCommercialActivity] =
    useState("Alimentos");
  const [commercialActivitiesOptions, setCommercialActivitiesOptions] =
    useState(() => {
      if (!tally.commercialActivities)
        return defaultCommercialActivitiesOptions;

      const customOptions = Object.keys(tally.commercialActivities)
        .filter(
          (activity) =>
            activity !== "Alimentos" &&
            activity !== "Produtos" &&
            activity !== "Pula-pula (ou outra ativ. infantil)" &&
            activity !== "Mesas de bares do entorno" &&
            activity !== "Outros" &&
            activity !== "Criar nova atividade",
        )
        .map((activity) => ({ value: activity, label: activity }));

      return [...defaultCommercialActivitiesOptions, ...customOptions];
    });

  const [weatherStats, setWeatherStats] = useState<WeatherStats>({
    temperature: tally.temperature ? tally.temperature : null,
    weather: tally.weatherCondition ? tally.weatherCondition : "SUNNY",
  });

  const [complementaryData, setComplementaryData] = useState({
    animalsAmount: tally.animalsAmount ? tally.animalsAmount : 0,
    groupsAmount: tally.groups ? tally.groups : 0,
  });
  const [personCharacteristics, setPersonCharacteristics] =
    useState<PersonCharacteristics>({
      FEMALE: {
        activity: "SEDENTARY",
        isTraversing: false,
        isPersonWithImpairment: false,
        isInApparentIllicitActivity: false,
        isPersonWithoutHousing: false,
      },
      MALE: {
        activity: "SEDENTARY",
        isTraversing: false,
        isPersonWithImpairment: false,
        isInApparentIllicitActivity: false,
        isPersonWithoutHousing: false,
      },
    });

  const handlePersonAdd = (gender: GenderType, ageGroup: AgeGroupType) => {
    const key = `${gender}-${ageGroup}-${personCharacteristics[gender].activity}-${personCharacteristics[gender].isTraversing}-${personCharacteristics[gender].isPersonWithImpairment}-${personCharacteristics[gender].isInApparentIllicitActivity}-${personCharacteristics[gender].isPersonWithoutHousing}`;
    setTallyMap((prev) => {
      const newMap = new Map(prev);
      const prevValue = newMap.get(key) || 0;
      newMap.set(key, prevValue + 1);
      return newMap;
    });
  };
  const handlePersonRemoval = (gender: GenderType, ageGroup: AgeGroupType) => {
    const key = `${gender}-${ageGroup}-${personCharacteristics[gender].activity}-${personCharacteristics[gender].isTraversing}-${personCharacteristics[gender].isPersonWithImpairment}-${personCharacteristics[gender].isInApparentIllicitActivity}-${personCharacteristics[gender].isPersonWithoutHousing}`;
    setTallyMap((prev) => {
      const newMap = new Map(prev);
      const prevValue = newMap.get(key);
      if (prevValue) {
        if (prevValue - 1 < 0) newMap.set(key, 0);
        else newMap.set(key, prevValue - 1);
      }
      return newMap;
    });
  };

  const countPeople = (
    gender: GenderType,
    ageGroup: AgeGroupType,
    activity: ActivityType,
    isTraversing: boolean,
    isPersonWithImpairment: boolean,
    isInApparentIllicitActivity: boolean,
    isPersonWithoutHousing: boolean,
  ) => {
    let count = 0;
    const filter = new RegExp(
      `^${gender}-${ageGroup}-${activity}-${isTraversing}-${isPersonWithImpairment}-${isInApparentIllicitActivity}-${isPersonWithoutHousing}`,
    );
    tallyMap.forEach((value, key) => {
      if (filter.test(key)) count += value;
    });
    return count;
  };
  return (
    <div className="flex h-full max-h-full min-h-0 w-full bg-white text-black">
      <div className="flex w-full flex-row gap-5 overflow-auto rounded-3xl bg-gray-300/30 p-3 shadow-md">
        <div className="flex w-full flex-col xl:basis-2/3">
          <CAdminHeader
            titleIcon={<GrGroup size={28} />}
            title={`Contagem em ${tally?.location.name}`}
          />
          <div className="flex flex-wrap">
            <div className="ml-auto flex flex-wrap gap-1 xl:hidden">
              <TallyInProgressReviewModal
                tally={tally}
                weatherStats={weatherStats}
                complementaryData={complementaryData}
                commercialActivities={commercialActivities}
                tallyMap={tallyMap}
              />
              <TallyInProgressSaveModal
                submittingObj={submittingObj}
                tallyId={tallyId}
                locationId={locationId}
                weatherStats={weatherStats}
                complementaryData={complementaryData}
                commercialActivities={commercialActivities}
                tallyMap={tallyMap}
                setSubmittingObj={setSubmittingObj}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 overflow-auto">
            <div className="flex flex-col gap-1">
              <CAccordion defaultExpanded>
                <CAccordionSummary>
                  <span className="flex items-center">
                    <TiWeatherPartlySunny />
                    Dados climáticos
                  </span>
                </CAccordionSummary>
                <CAccordionDetails>
                  <div className="flex w-full flex-row items-center gap-1">
                    <CNumberField
                      label="Temperatura"
                      tooltip="Temperatura"
                      alignEndAdornmentWithText
                      endAdornment={<span className="mt-4">°C</span>}
                      sx={{
                        width: "11rem",
                      }}
                      onChange={(v) => {
                        if (v === null) {
                          setWeatherStats((prev) => ({
                            ...prev,
                            temperature: null,
                          }));
                        } else {
                          setWeatherStats((prev) => ({
                            ...prev,
                            temperature: v,
                          }));
                        }
                      }}
                    />
                    <CAutocomplete
                      className="w-full"
                      label="Clima"
                      disableClearable
                      value={weatherStats.weather}
                      options={Object.values(WeatherConditions)}
                      getOptionLabel={(option) =>
                        weatherNameMap.get(option) || option
                      }
                      onChange={(_, v) =>
                        setWeatherStats((prev) => ({
                          ...prev,
                          weather: v,
                        }))
                      }
                    />
                  </div>
                </CAccordionDetails>
              </CAccordion>
            </div>
            <CAccordion defaultExpanded>
              <CAccordionSummary>
                <span className="flex items-center">
                  <GrGroup />
                  Pessoas
                </span>
              </CAccordionSummary>
              <CAccordionDetails>
                <div className="flex flex-col gap-5">
                  <Paper
                    elevation={5}
                    sx={{ display: "flex", borderLeft: "4px solid blue" }}
                  >
                    <div className="flex flex-1 flex-col gap-1 rounded-md px-1 py-2">
                      <h5 className="text-xl font-semibold">Homens</h5>

                      <div className="flex w-full items-center justify-center">
                        <div className="inline-flex w-auto flex-row gap-1 rounded-xl bg-gray-400/20 py-1 shadow-inner">
                          <Button
                            variant={"ghost"}
                            onPress={() =>
                              setPersonCharacteristics((prev) => ({
                                ...prev,
                                MALE: { ...prev.MALE, activity: "SEDENTARY" },
                              }))
                            }
                            className={`rounded-xl px-4 py-6 ${personCharacteristics.MALE.activity === "SEDENTARY" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
                          >
                            <BsPersonStanding size={32} />
                          </Button>
                          <Button
                            variant={"ghost"}
                            onPress={() =>
                              setPersonCharacteristics((prev) => ({
                                ...prev,
                                MALE: { ...prev.MALE, activity: "WALKING" },
                              }))
                            }
                            className={`rounded-xl bg-blue-500 px-4 py-6 ${personCharacteristics.MALE.activity === "WALKING" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
                          >
                            <FaPersonWalking size={32} />
                          </Button>
                          <Button
                            variant={"ghost"}
                            onPress={() =>
                              setPersonCharacteristics((prev) => ({
                                ...prev,
                                MALE: { ...prev.MALE, activity: "STRENUOUS" },
                              }))
                            }
                            className={`rounded-xl bg-blue-500 px-4 py-6 ${personCharacteristics.MALE.activity === "STRENUOUS" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
                          >
                            <FaPersonRunning size={32} />
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-center gap-2 py-1">
                        <CCheckbox
                          label="Passando"
                          onChange={(e) =>
                            setPersonCharacteristics((prev) => ({
                              ...prev,
                              MALE: {
                                ...prev.MALE,
                                isTraversing: e.target.checked,
                              },
                            }))
                          }
                        />

                        <CCheckbox
                          label="Deficiente"
                          onChange={(e) =>
                            setPersonCharacteristics((prev) => ({
                              ...prev,
                              MALE: {
                                ...prev.MALE,
                                isPersonWithImpairment: e.target.checked,
                              },
                            }))
                          }
                        />
                        <CCheckbox
                          label="Atividade ilícita"
                          onChange={(e) =>
                            setPersonCharacteristics((prev) => ({
                              ...prev,
                              MALE: {
                                ...prev.MALE,
                                isInApparentIllicitActivity: e.target.checked,
                              },
                            }))
                          }
                        />
                        <CCheckbox
                          label="Situação de rua"
                          onChange={(e) =>
                            setPersonCharacteristics((prev) => ({
                              ...prev,
                              MALE: {
                                ...prev.MALE,
                                isPersonWithoutHousing: e.target.checked,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="flex flex-wrap justify-center gap-5">
                        <CounterButtonGroup
                          label="Criança"
                          count={countPeople(
                            "MALE",
                            "CHILD",
                            personCharacteristics.MALE.activity,
                            personCharacteristics.MALE.isTraversing,
                            personCharacteristics.MALE.isPersonWithImpairment,
                            personCharacteristics.MALE
                              .isInApparentIllicitActivity,
                            personCharacteristics.MALE.isPersonWithoutHousing,
                          )}
                          onIncrement={() => {
                            handlePersonAdd("MALE", "CHILD");
                          }}
                          onDecrement={() => {
                            handlePersonRemoval("MALE", "CHILD");
                          }}
                        />

                        <CounterButtonGroup
                          label="Jovem"
                          count={countPeople(
                            "MALE",
                            "TEEN",
                            personCharacteristics.MALE.activity,
                            personCharacteristics.MALE.isTraversing,
                            personCharacteristics.MALE.isPersonWithImpairment,
                            personCharacteristics.MALE
                              .isInApparentIllicitActivity,
                            personCharacteristics.MALE.isPersonWithoutHousing,
                          )}
                          onIncrement={() => {
                            handlePersonAdd("MALE", "TEEN");
                          }}
                          onDecrement={() => {
                            handlePersonRemoval("MALE", "TEEN");
                          }}
                        />

                        <CounterButtonGroup
                          label="Adulto"
                          count={countPeople(
                            "MALE",
                            "ADULT",
                            personCharacteristics.MALE.activity,
                            personCharacteristics.MALE.isTraversing,
                            personCharacteristics.MALE.isPersonWithImpairment,
                            personCharacteristics.MALE
                              .isInApparentIllicitActivity,
                            personCharacteristics.MALE.isPersonWithoutHousing,
                          )}
                          onIncrement={() => {
                            handlePersonAdd("MALE", "ADULT");
                          }}
                          onDecrement={() => {
                            handlePersonRemoval("MALE", "ADULT");
                          }}
                        />

                        <CounterButtonGroup
                          label="Idoso"
                          count={countPeople(
                            "MALE",
                            "ELDERLY",
                            personCharacteristics.MALE.activity,
                            personCharacteristics.MALE.isTraversing,
                            personCharacteristics.MALE.isPersonWithImpairment,
                            personCharacteristics.MALE
                              .isInApparentIllicitActivity,
                            personCharacteristics.MALE.isPersonWithoutHousing,
                          )}
                          onIncrement={() => {
                            handlePersonAdd("MALE", "ELDERLY");
                          }}
                          onDecrement={() => {
                            handlePersonRemoval("MALE", "ELDERLY");
                          }}
                        />
                      </div>
                    </div>
                  </Paper>
                  <Paper
                    elevation={5}
                    sx={{ display: "flex", borderLeft: "4px solid red" }}
                  >
                    <div className="flex flex-1 flex-col gap-1 rounded-md px-1 py-2">
                      <h5 className="text-xl font-semibold">Mulheres</h5>
                      <div className="flex w-full items-center justify-center">
                        <div className="inline-flex w-auto flex-row gap-1 rounded-xl bg-gray-400/20 py-1 shadow-inner">
                          <Button
                            variant={"ghost"}
                            onPress={() =>
                              setPersonCharacteristics((prev) => ({
                                ...prev,
                                FEMALE: {
                                  ...prev.FEMALE,
                                  activity: "SEDENTARY",
                                },
                              }))
                            }
                            className={`rounded-xl px-4 py-6 ${personCharacteristics.FEMALE.activity === "SEDENTARY" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
                          >
                            <BsPersonStandingDress size={32} />
                          </Button>
                          <Button
                            variant={"ghost"}
                            onPress={() =>
                              setPersonCharacteristics((prev) => ({
                                ...prev,
                                FEMALE: { ...prev.FEMALE, activity: "WALKING" },
                              }))
                            }
                            className={`rounded-xl bg-blue-500 px-4 py-6 ${personCharacteristics.FEMALE.activity === "WALKING" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
                          >
                            <FaPersonWalking size={32} />
                          </Button>
                          <Button
                            variant={"ghost"}
                            onPress={() =>
                              setPersonCharacteristics((prev) => ({
                                ...prev,
                                FEMALE: {
                                  ...prev.FEMALE,
                                  activity: "STRENUOUS",
                                },
                              }))
                            }
                            className={`rounded-xl bg-blue-500 px-4 py-6 ${personCharacteristics.FEMALE.activity === "STRENUOUS" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
                          >
                            <FaPersonRunning size={32} />
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-center gap-2 py-1">
                        <CCheckbox
                          label="Passando"
                          onChange={(e) =>
                            setPersonCharacteristics((prev) => ({
                              ...prev,
                              FEMALE: {
                                ...prev.FEMALE,
                                isTraversing: e.target.checked,
                              },
                            }))
                          }
                        />
                        <CCheckbox
                          label="Deficiente"
                          onChange={(e) =>
                            setPersonCharacteristics((prev) => ({
                              ...prev,
                              FEMALE: {
                                ...prev.FEMALE,
                                isPersonWithImpairment: e.target.checked,
                              },
                            }))
                          }
                        />

                        <CCheckbox
                          label=" Atividade ilícita"
                          onChange={(e) =>
                            setPersonCharacteristics((prev) => ({
                              ...prev,
                              FEMALE: {
                                ...prev.FEMALE,
                                isInApparentIllicitActivity: e.target.checked,
                              },
                            }))
                          }
                        />
                        <CCheckbox
                          label="Situação de rua"
                          onChange={(e) =>
                            setPersonCharacteristics((prev) => ({
                              ...prev,
                              FEMALE: {
                                ...prev.FEMALE,
                                isPersonWithoutHousing: e.target.checked,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="flex flex-wrap justify-center gap-5">
                        <CounterButtonGroup
                          label="Criança"
                          onIncrement={() => {
                            handlePersonAdd("FEMALE", "CHILD");
                          }}
                          onDecrement={() => {
                            handlePersonRemoval("FEMALE", "CHILD");
                          }}
                          count={countPeople(
                            "FEMALE",
                            "CHILD",
                            personCharacteristics.FEMALE.activity,
                            personCharacteristics.FEMALE.isTraversing,
                            personCharacteristics.FEMALE.isPersonWithImpairment,
                            personCharacteristics.FEMALE
                              .isInApparentIllicitActivity,
                            personCharacteristics.FEMALE.isPersonWithoutHousing,
                          )}
                        />

                        <CounterButtonGroup
                          label="Jovem"
                          onIncrement={() => {
                            handlePersonAdd("FEMALE", "TEEN");
                          }}
                          onDecrement={() => {
                            handlePersonRemoval("FEMALE", "TEEN");
                          }}
                          count={countPeople(
                            "FEMALE",
                            "TEEN",
                            personCharacteristics.FEMALE.activity,
                            personCharacteristics.FEMALE.isTraversing,
                            personCharacteristics.FEMALE.isPersonWithImpairment,
                            personCharacteristics.FEMALE
                              .isInApparentIllicitActivity,
                            personCharacteristics.FEMALE.isPersonWithoutHousing,
                          )}
                        />
                        <CounterButtonGroup
                          label="Adulta"
                          onIncrement={() => {
                            handlePersonAdd("FEMALE", "ADULT");
                          }}
                          onDecrement={() => {
                            handlePersonRemoval("FEMALE", "ADULT");
                          }}
                          count={countPeople(
                            "FEMALE",
                            "ADULT",
                            personCharacteristics.FEMALE.activity,
                            personCharacteristics.FEMALE.isTraversing,
                            personCharacteristics.FEMALE.isPersonWithImpairment,
                            personCharacteristics.FEMALE
                              .isInApparentIllicitActivity,
                            personCharacteristics.FEMALE.isPersonWithoutHousing,
                          )}
                        />
                        <CounterButtonGroup
                          label="Idosa"
                          onIncrement={() => {
                            handlePersonAdd("FEMALE", "ELDERLY");
                          }}
                          onDecrement={() => {
                            handlePersonRemoval("FEMALE", "ELDERLY");
                          }}
                          count={countPeople(
                            "FEMALE",
                            "ELDERLY",
                            personCharacteristics.FEMALE.activity,
                            personCharacteristics.FEMALE.isTraversing,
                            personCharacteristics.FEMALE.isPersonWithImpairment,
                            personCharacteristics.FEMALE
                              .isInApparentIllicitActivity,
                            personCharacteristics.FEMALE.isPersonWithoutHousing,
                          )}
                        />
                      </div>
                    </div>
                  </Paper>
                </div>
              </CAccordionDetails>
            </CAccordion>

            <CAccordion defaultExpanded>
              <CAccordionSummary>
                <span className="flex items-center">
                  <IconClipboardData />
                  Dados complementares
                </span>
              </CAccordionSummary>
              <CAccordionDetails>
                <div className="flex flex-wrap justify-center gap-5">
                  <CounterButtonGroup
                    label="Pets"
                    count={complementaryData.animalsAmount}
                    onIncrement={() => {
                      setComplementaryData((prev) => ({
                        ...prev,
                        animalsAmount: prev.animalsAmount + 1,
                      }));
                    }}
                    onDecrement={() => {
                      if (complementaryData.animalsAmount !== 0)
                        setComplementaryData((prev) => ({
                          ...prev,
                          animalsAmount: prev.animalsAmount - 1,
                        }));
                    }}
                  />
                  <CounterButtonGroup
                    label="Grupos"
                    count={complementaryData.groupsAmount}
                    onIncrement={() => {
                      setComplementaryData((prev) => ({
                        ...prev,
                        groupsAmount: prev.groupsAmount + 1,
                      }));
                    }}
                    onDecrement={() => {
                      if (complementaryData.groupsAmount !== 0)
                        setComplementaryData((prev) => ({
                          ...prev,
                          groupsAmount: prev.groupsAmount - 1,
                        }));
                    }}
                  />
                </div>
              </CAccordionDetails>
            </CAccordion>
            <CAccordion defaultExpanded>
              <CAccordionSummary>
                <span className="flex items-center">
                  <IconMoodDollar />
                  Atividades comerciais itinerantes
                </span>
              </CAccordionSummary>
              <CAccordionDetails>
                <div className="flex flex-col gap-1">
                  <CAutocomplete
                    label="Atividade"
                    className="w-full"
                    defaultValue={commercialActivitiesOptions[0]}
                    options={commercialActivitiesOptions}
                    disableClearable
                    getOptionLabel={(o) => o.label}
                    isOptionEqualToValue={(a, b) => a.value === b.value}
                    showAppendButtonWhenClear
                    onChange={(_, v) => {
                      setSelectedCommercialActivity(v.value);
                    }}
                    suffixButtonChildren={<IconPlus />}
                    onSuffixButtonClick={() => {
                      setOpenCommercialActivityCreationDialog(true);
                    }}
                    appendIconButtonSx={{ color: "red" }}
                    appendIconButton={
                      (
                        !defaultCommercialActivitiesOptions.some(
                          (d) => d.value === selectedCommercialActivity,
                        )
                      ) ?
                        <IconTrashX />
                      : undefined
                    }
                    onAppendIconButtonClick={() => {
                      const currentActivityCount =
                        commercialActivities[selectedCommercialActivity] || 0;

                      if (!currentActivityCount || currentActivityCount === 0) {
                        setCommercialActivitiesOptions((prev) => {
                          const newArray: { label: string; value: string }[] =
                            [];
                          for (const option of prev) {
                            if (option.value !== selectedCommercialActivity) {
                              newArray.push(option);
                            }
                          }
                          return newArray;
                        });
                        setSelectedCommercialActivity(
                          () => defaultCommercialActivitiesOptions[0]!.value,
                        );
                        setHelperCard({
                          show: true,
                          helperCardType: "CONFIRM",
                          content: (
                            <>Atividade comercial itinerante removida!</>
                          ),
                        });
                      } else {
                        setHelperCard({
                          show: true,
                          helperCardType: "ERROR",
                          content: (
                            <>
                              Não é possível remover uma atividade comercial com
                              quantidade maior que 0!
                            </>
                          ),
                        });
                      }
                    }}
                  />
                  <CounterButtonGroup
                    label={selectedCommercialActivity}
                    count={
                      commercialActivities[selectedCommercialActivity] || 0
                    }
                    onDecrement={() => {
                      setCommercialActivities((prev) => {
                        const newObject = { ...prev };
                        if (newObject[selectedCommercialActivity]) {
                          newObject[selectedCommercialActivity] -= 1;
                        }
                        return newObject;
                      });
                    }}
                    onIncrement={() => {
                      setCommercialActivities((prev) => {
                        const newObject = { ...prev };
                        if (newObject[selectedCommercialActivity]) {
                          newObject[selectedCommercialActivity] += 1;
                        } else {
                          newObject[selectedCommercialActivity] = 1;
                        }
                        return newObject;
                      });
                    }}
                  />
                </div>
              </CAccordionDetails>
            </CAccordion>
          </div>
        </div>
        <div className="hidden min-w-[525px] basis-1/3 rounded-3xl bg-gray-400/20 shadow-inner xl:block">
          <TallyInProgressReview
            submittingObj={submittingObj}
            tallyId={tallyId}
            locationId={locationId}
            tally={tally}
            weatherStats={weatherStats}
            complementaryData={complementaryData}
            commercialActivities={commercialActivities}
            tallyMap={tallyMap}
            setSubmittingObj={setSubmittingObj}
          />
        </div>
      </div>
      <CommercialActivityCreationDialog
        open={openCommercialActivityCreationDialog}
        onClose={() => setOpenCommercialActivityCreationDialog(false)}
        create={(activity: string) => {
          activity =
            activity.trim().charAt(0).toUpperCase() + activity.trim().slice(1);
          if (
            !activity ||
            activity === "" ||
            commercialActivitiesOptions.some(
              (option) => option.value === activity,
            )
          ) {
            setHelperCard({
              show: true,
              helperCardType: "ERROR",
              content: (
                <>Atividade comercial itinerante já existente ou inválida!</>
              ),
            });
            return;
          } else {
            setCommercialActivitiesOptions((prev) => [
              ...prev,
              { value: activity, label: activity },
            ]);
            setHelperCard({
              show: true,
              helperCardType: "CONFIRM",
              content: (
                <>{`Atividade comercial itinerante "${activity} registrada"!`}</>
              ),
            });
          }
        }}
      />
    </div>
  );
};

export { TallyInProgressPage };
export { type SubmittingObj };
