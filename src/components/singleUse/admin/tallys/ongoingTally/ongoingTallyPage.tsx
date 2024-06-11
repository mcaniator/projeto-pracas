"use client";

import { Button } from "@/components/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { saveOngoingTallyData } from "@/serverActions/tallyUtil";
import { Gender } from "@prisma/client";
import { Activity } from "@prisma/client";
import { AgeGroup } from "@prisma/client";
import { WeatherConditions } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";
import { error } from "console";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import React from "react";

interface CommercialActivitiesObject {
  [key: string]: number;
}

interface TallyPerson {
  person: {
    gender: Gender;
    ageGroup: AgeGroup;
    activity: Activity;
    isTraversing: boolean;
    isPersonWithImpairment: boolean;
    isInApparentIllicitActivity: boolean;
    isPersonWithoutHousing: boolean;
  };
  quantity: number;
}
interface ongoingTallyDataFetched {
  tallyPerson: TallyPerson[];
  location: {
    name: string;
  };
  startDate: Date;
  endDate: Date | null;
  observer: string;
  animalsAmount: number | null;
  groups: number | null;
  temperature: number | null;
  weatherCondition: WeatherConditions | null;
  commercialActivities: JsonValue;
}
interface WeatherStats {
  temperature: number;
  weather: WeatherConditions;
}

interface PersonCharacteristics {
  FEMALE: {
    activity: Activity;
    isTraversing: boolean;
    isPersonWithImpairment: boolean;
    isInApparentIllicitActivity: boolean;
    isPersonWithoutHousing: boolean;
  };
  MALE: {
    activity: Activity;
    isTraversing: boolean;
    isPersonWithImpairment: boolean;
    isInApparentIllicitActivity: boolean;
    isPersonWithoutHousing: boolean;
  };
}
const weatherNameMap = new Map([
  ["SUNNY", "Com sol"],
  ["CLOUDY", "Nublado"],
]);
const OngoingTallyPage = ({
  tallyId,
  tally,
}: {
  tallyId: number;
  tally: ongoingTallyDataFetched;
}) => {
  let endDate: Date;
  const handleDataSubmit = async (endTally: boolean) => {
    if (endTally) {
      if (!endDate) {
        setValidEndDate(false);
        console.log(validEndDate);
        return;
      } else setValidEndDate(true);
    }
    endTally ? setSubmittingAndEnding(true) : setSubmitting(true);
    await saveOngoingTallyData(
      tallyId,
      weatherStats,
      tallyMap,
      commercialActivities,
      complementaryData,
      endTally ? endDate : null,
    );
    endTally ? setSubmittingAndEnding(false) : setSubmitting(false);
  };
  const [submitting, setSubmitting] = useState(false);
  const [submittingAndEnding, setSubmittingAndEnding] = useState(false);
  const [validEndDate, setValidEndDate] = useState(true);
  const [tallyMap, setTallyMap] = useState<Map<string, number>>(() => {
    const tallyMap = new Map();
    for (const tallyPerson of tally.tallyPerson) {
      const gender = tallyPerson.person.gender;
      const ageGroup = tallyPerson.person.ageGroup;
      const activity = tallyPerson.person.activity;
      const isTraversing = tallyPerson.person.isTraversing;
      const isPersonWithImpairment = tallyPerson.person.isPersonWithImpairment;
      const isInApparentIllicitActivity =
        tallyPerson.person.isInApparentIllicitActivity;
      const isPersonWithoutHousing = tallyPerson.person.isPersonWithoutHousing;
      tallyMap.set(
        `${gender}-${ageGroup}-${activity}-${isTraversing}-${isPersonWithImpairment}-${isInApparentIllicitActivity}-${isPersonWithoutHousing}`,
        tallyPerson.quantity,
      );
    }

    return tallyMap;
  });
  const [commercialActivities, setCommercialActivities] =
    useState<CommercialActivitiesObject>(() => {
      if (tally.commercialActivities)
        return tally.commercialActivities as CommercialActivitiesObject;
      else return {};
    });
  const [selectedCommercialActivity, setSelectedCommercialActivity] =
    useState("Alimentos");
  const [commercialActivitiesOptions, setCommercialActivitiesOptions] =
    useState(() => {
      const defaultOptions = [
        { value: "Alimentos", label: "Alimentos" },
        { value: "Produtos", label: "Produtos" },
        {
          value: "Pula-pula (ou outra ativ. infantil)",
          label: "Pula-pula (ou outra ativ. infantil)",
        },
        { value: "Mesas de bares", label: "Mesas de bares" },
        { value: "Outros", label: "Outros" },
        { value: "other", label: "Criar nova atividade" },
      ];
      if (!tally.commercialActivities) return defaultOptions;

      const customOptions = Object.keys(tally.commercialActivities as string)
        .filter(
          (activity) =>
            activity !== "Alimentos" &&
            activity !== "Produtos" &&
            activity !== "Pula-pula (ou outra ativ. infantil)" &&
            activity !== "Mesas de bares" &&
            activity !== "Outros" &&
            activity !== "Criar nova atividade",
        )
        .map((activity) => ({ value: activity, label: activity }));

      return [...defaultOptions, ...customOptions];
    });
  //console.log(Object.keys(tally.commercialActivities as string));
  const [newCommercialActivityInput, setNewCommercialActivityInput] =
    useState("");
  const deferredNewCommercialActivityInput = useDeferredValue(
    newCommercialActivityInput,
  );
  const [weatherStats, setWeatherStats] = useState<WeatherStats>({
    temperature: tally.temperature ? tally.temperature : 0,
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

  const handlePersonAdd = (gender: Gender, ageGroup: AgeGroup) => {
    const key = `${gender}-${ageGroup}-${personCharacteristics[gender].activity}-${personCharacteristics[gender].isTraversing}-${personCharacteristics[gender].isPersonWithImpairment}-${personCharacteristics[gender].isInApparentIllicitActivity}-${personCharacteristics[gender].isPersonWithoutHousing}`;
    setTallyMap((prev) => {
      const newMap = new Map(prev);
      const prevValue = newMap.get(key) || 0;
      newMap.set(key, prevValue + 1);
      return newMap;
    });
  };
  const handlePersonRemoval = (gender: Gender, ageGroup: AgeGroup) => {
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
  useEffect(() => {
    console.log(tallyMap);
  }, [tallyMap]);
  useEffect(() => {
    console.log(commercialActivities);
  }, [commercialActivities]);
  const countPeople = (
    gender: Gender,
    ageGroup: AgeGroup,
    activity: Activity,
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
    <div className="flex max-h-[calc(100vh-5.5rem)] min-h-0 w-fit gap-5 p-5">
      <div className="flex flex-row gap-5 overflow-auto rounded-3xl bg-gray-300/30 p-3 text-white shadow-md">
        <div className="flex flex-col">
          <h3 className="text-2xl font-semibold">
            Contagem em {tally?.location.name}
          </h3>
          <div className="flex flex-col gap-5 overflow-auto">
            <div className="flex flex-col gap-1">
              <h4 className="text-2xl font-semibold">Dados climáticos</h4>
              <div className="flex flex-row gap-5">
                <div className="flex flex-row items-center">
                  <label htmlFor="temperature-input" className="mr-1">
                    {"Temperatura (°C):"}
                  </label>
                  <Input
                    value={weatherStats.temperature}
                    onChange={(e) =>
                      setWeatherStats((prev) => ({
                        ...prev,
                        temperature: Number(e.target.value),
                      }))
                    }
                    className="w-14"
                    type="number"
                    maxLength={2}
                  ></Input>
                </div>
                <div className="flex flex-grow flex-row items-center">
                  <label htmlFor="weatherSelect" className="mr-1">
                    Tempo:
                  </label>
                  <Select
                    value={weatherStats.weather}
                    onChange={(e) =>
                      setWeatherStats((prev) => ({
                        ...prev,
                        weather: e.target.value as WeatherConditions,
                      }))
                    }
                    id="weatherSelect"
                  >
                    <option value="SUNNY">Com Sol</option>
                    <option value="CLOUDY">Nublado</option>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <h4 className="text-2xl font-semibold">Pessoas</h4>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <h5 className="text-xl font-semibold">Homens</h5>
                  <div>
                    <div className="inline-flex w-auto gap-1 rounded-xl bg-gray-400/20 py-1 text-white shadow-inner">
                      <Button
                        onPress={() =>
                          setPersonCharacteristics((prev) => ({
                            ...prev,
                            MALE: { ...prev.MALE, activity: "SEDENTARY" },
                          }))
                        }
                        className={`rounded-xl px-4 py-1 ${personCharacteristics.MALE.activity === "SEDENTARY" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
                      >
                        Sedentário
                      </Button>
                      <Button
                        onPress={() =>
                          setPersonCharacteristics((prev) => ({
                            ...prev,
                            MALE: { ...prev.MALE, activity: "WALKING" },
                          }))
                        }
                        className={`rounded-xl bg-blue-500 px-4 py-1 ${personCharacteristics.MALE.activity === "WALKING" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
                      >
                        Caminhando
                      </Button>
                      <Button
                        onPress={() =>
                          setPersonCharacteristics((prev) => ({
                            ...prev,
                            MALE: { ...prev.MALE, activity: "STRENUOUS" },
                          }))
                        }
                        className={`rounded-xl bg-blue-500 px-4 py-1 ${personCharacteristics.MALE.activity === "STRENUOUS" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
                      >
                        Vigoroso
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-row gap-2 py-1">
                    <Checkbox
                      onChange={(e) =>
                        setPersonCharacteristics((prev) => ({
                          ...prev,
                          MALE: {
                            ...prev.MALE,
                            isTraversing: e.target.checked,
                          },
                        }))
                      }
                      variant={"admin"}
                    >
                      Passando
                    </Checkbox>
                    <Checkbox
                      onChange={(e) =>
                        setPersonCharacteristics((prev) => ({
                          ...prev,
                          MALE: {
                            ...prev.MALE,
                            isPersonWithImpairment: e.target.checked,
                          },
                        }))
                      }
                      variant={"admin"}
                    >
                      Deficiente
                    </Checkbox>
                    <Checkbox
                      onChange={(e) =>
                        setPersonCharacteristics((prev) => ({
                          ...prev,
                          MALE: {
                            ...prev.MALE,
                            isInApparentIllicitActivity: e.target.checked,
                          },
                        }))
                      }
                      variant={"admin"}
                    >
                      Atividade ilícita
                    </Checkbox>
                    <Checkbox
                      onChange={(e) =>
                        setPersonCharacteristics((prev) => ({
                          ...prev,
                          MALE: {
                            ...prev.MALE,
                            isPersonWithoutHousing: e.target.checked,
                          },
                        }))
                      }
                      variant={"admin"}
                    >
                      Situação de rua
                    </Checkbox>
                  </div>
                  <div className="flex flex-row gap-5">
                    <div className="flex flex-col items-center">
                      <h6 className="text-xl font-semibold">Criança</h6>
                      <div className="flex flex-row items-center gap-1">
                        <Button
                          isDisabled={submitting}
                          onPress={() => handlePersonRemoval("MALE", "CHILD")}
                          className="h-8 w-8 text-3xl"
                          variant={"admin"}
                        >
                          -
                        </Button>
                        <p
                          style={{ minWidth: "1.8rem" }}
                          className="text-center"
                        >
                          {countPeople(
                            "MALE",
                            "CHILD",
                            personCharacteristics.MALE.activity,
                            personCharacteristics.MALE.isTraversing,
                            personCharacteristics.MALE.isPersonWithImpairment,
                            personCharacteristics.MALE
                              .isInApparentIllicitActivity,
                            personCharacteristics.MALE.isPersonWithoutHousing,
                          )}
                        </p>
                        <Button
                          isDisabled={submitting}
                          onPress={() => handlePersonAdd("MALE", "CHILD")}
                          className="h-8 w-8 text-3xl"
                          variant={"admin"}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <h6 className="text-xl font-semibold">Jovem</h6>
                      <div className="flex flex-row items-center gap-1">
                        <Button
                          isDisabled={submitting}
                          onPress={() => handlePersonRemoval("MALE", "TEEN")}
                          className="h-8 w-8 text-3xl"
                          variant={"admin"}
                        >
                          -
                        </Button>
                        <p
                          style={{ minWidth: "1.8rem" }}
                          className="text-center"
                        >
                          {countPeople(
                            "MALE",
                            "TEEN",
                            personCharacteristics.MALE.activity,
                            personCharacteristics.MALE.isTraversing,
                            personCharacteristics.MALE.isPersonWithImpairment,
                            personCharacteristics.MALE
                              .isInApparentIllicitActivity,
                            personCharacteristics.MALE.isPersonWithoutHousing,
                          )}
                        </p>
                        <Button
                          isDisabled={submitting}
                          onPress={() => handlePersonAdd("MALE", "TEEN")}
                          className="h-8 w-8 text-3xl"
                          variant={"admin"}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <h6 className="text-xl font-semibold">Adulto</h6>
                      <div className="flex flex-row items-center gap-1">
                        <Button
                          isDisabled={submitting}
                          onPress={() => handlePersonRemoval("MALE", "ADULT")}
                          className="h-8 w-8 text-3xl"
                          variant={"admin"}
                        >
                          -
                        </Button>
                        <p
                          style={{ minWidth: "1.8rem" }}
                          className="text-center"
                        >
                          {countPeople(
                            "MALE",
                            "ADULT",
                            personCharacteristics.MALE.activity,
                            personCharacteristics.MALE.isTraversing,
                            personCharacteristics.MALE.isPersonWithImpairment,
                            personCharacteristics.MALE
                              .isInApparentIllicitActivity,
                            personCharacteristics.MALE.isPersonWithoutHousing,
                          )}
                        </p>
                        <Button
                          isDisabled={submitting}
                          onPress={() => handlePersonAdd("MALE", "ADULT")}
                          className="h-8 w-8 text-3xl"
                          variant={"admin"}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <h6 className="text-xl font-semibold">Idoso</h6>
                      <div className="flex flex-row items-center gap-1">
                        <Button
                          isDisabled={submitting}
                          onPress={() => handlePersonRemoval("MALE", "ELDERLY")}
                          className="h-8 w-8 text-3xl"
                          variant={"admin"}
                        >
                          -
                        </Button>
                        <p
                          style={{ minWidth: "1.8rem" }}
                          className="text-center"
                        >
                          {countPeople(
                            "MALE",
                            "ELDERLY",
                            personCharacteristics.MALE.activity,
                            personCharacteristics.MALE.isTraversing,
                            personCharacteristics.MALE.isPersonWithImpairment,
                            personCharacteristics.MALE
                              .isInApparentIllicitActivity,
                            personCharacteristics.MALE.isPersonWithoutHousing,
                          )}
                        </p>
                        <Button
                          isDisabled={submitting}
                          onPress={() => handlePersonAdd("MALE", "ELDERLY")}
                          className="h-8 w-8 text-3xl"
                          variant={"admin"}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <h5 className="text-xl font-semibold">Mulheres</h5>
                  <div>
                    <div className="inline-flex w-auto gap-1 rounded-xl bg-gray-400/20 py-1 text-white shadow-inner">
                      <Button
                        onPress={() =>
                          setPersonCharacteristics((prev) => ({
                            ...prev,
                            FEMALE: { ...prev.FEMALE, activity: "SEDENTARY" },
                          }))
                        }
                        className={`rounded-xl px-4 py-1 ${personCharacteristics.FEMALE.activity === "SEDENTARY" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
                      >
                        Sedentária
                      </Button>
                      <Button
                        onPress={() =>
                          setPersonCharacteristics((prev) => ({
                            ...prev,
                            FEMALE: { ...prev.FEMALE, activity: "WALKING" },
                          }))
                        }
                        className={`rounded-xl bg-blue-500 px-4 py-1 ${personCharacteristics.FEMALE.activity === "WALKING" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
                      >
                        Caminhando
                      </Button>
                      <Button
                        onPress={() =>
                          setPersonCharacteristics((prev) => ({
                            ...prev,
                            FEMALE: { ...prev.FEMALE, activity: "STRENUOUS" },
                          }))
                        }
                        className={`rounded-xl bg-blue-500 px-4 py-1 ${personCharacteristics.FEMALE.activity === "STRENUOUS" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
                      >
                        Vigorosa
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-row gap-2 py-1">
                    <Checkbox
                      onChange={(e) =>
                        setPersonCharacteristics((prev) => ({
                          ...prev,
                          FEMALE: {
                            ...prev.FEMALE,
                            isTraversing: e.target.checked,
                          },
                        }))
                      }
                      variant={"admin"}
                    >
                      Passando
                    </Checkbox>
                    <Checkbox
                      onChange={(e) =>
                        setPersonCharacteristics((prev) => ({
                          ...prev,
                          FEMALE: {
                            ...prev.FEMALE,
                            isPersonWithImpairment: e.target.checked,
                          },
                        }))
                      }
                      variant={"admin"}
                    >
                      Deficiente
                    </Checkbox>
                    <Checkbox
                      onChange={(e) =>
                        setPersonCharacteristics((prev) => ({
                          ...prev,
                          FEMALE: {
                            ...prev.FEMALE,
                            isInApparentIllicitActivity: e.target.checked,
                          },
                        }))
                      }
                      variant={"admin"}
                    >
                      Atividade ilícita
                    </Checkbox>
                    <Checkbox
                      onChange={(e) =>
                        setPersonCharacteristics((prev) => ({
                          ...prev,
                          FEMALE: {
                            ...prev.FEMALE,
                            isPersonWithoutHousing: e.target.checked,
                          },
                        }))
                      }
                      variant={"admin"}
                    >
                      Situação de rua
                    </Checkbox>
                  </div>
                  <div className="flex flex-row gap-5">
                    <div className="flex flex-col items-center">
                      <h6 className="text-xl font-semibold">Criança</h6>
                      <div className="flex flex-row items-center gap-1">
                        <Button
                          isDisabled={submitting}
                          onPress={() => handlePersonRemoval("FEMALE", "CHILD")}
                          className="h-8 w-8 text-3xl"
                          variant={"admin"}
                        >
                          -
                        </Button>
                        <p
                          style={{ minWidth: "1.8rem" }}
                          className="text-center"
                        >
                          {countPeople(
                            "FEMALE",
                            "CHILD",
                            personCharacteristics.FEMALE.activity,
                            personCharacteristics.FEMALE.isTraversing,
                            personCharacteristics.FEMALE.isPersonWithImpairment,
                            personCharacteristics.FEMALE
                              .isInApparentIllicitActivity,
                            personCharacteristics.FEMALE.isPersonWithoutHousing,
                          )}
                        </p>
                        <Button
                          isDisabled={submitting}
                          onPress={() => handlePersonAdd("FEMALE", "CHILD")}
                          className="h-8 w-8 text-3xl"
                          variant={"admin"}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <h6 className="text-xl font-semibold">Jovem</h6>
                      <div className="flex flex-row items-center gap-1">
                        <Button
                          isDisabled={submitting}
                          onPress={() => handlePersonRemoval("FEMALE", "TEEN")}
                          className="h-8 w-8 text-3xl"
                          variant={"admin"}
                        >
                          -
                        </Button>
                        <p
                          style={{ minWidth: "1.8rem" }}
                          className="text-center"
                        >
                          {countPeople(
                            "FEMALE",
                            "TEEN",
                            personCharacteristics.FEMALE.activity,
                            personCharacteristics.FEMALE.isTraversing,
                            personCharacteristics.FEMALE.isPersonWithImpairment,
                            personCharacteristics.FEMALE
                              .isInApparentIllicitActivity,
                            personCharacteristics.FEMALE.isPersonWithoutHousing,
                          )}
                        </p>
                        <Button
                          isDisabled={submitting}
                          onPress={() => handlePersonAdd("FEMALE", "TEEN")}
                          className="h-8 w-8 text-3xl"
                          variant={"admin"}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <h6 className="text-xl font-semibold">Adulta</h6>
                      <div className="flex flex-row items-center gap-1">
                        <Button
                          isDisabled={submitting}
                          onPress={() => handlePersonRemoval("FEMALE", "ADULT")}
                          className="h-8 w-8 text-3xl"
                          variant={"admin"}
                        >
                          -
                        </Button>
                        <p
                          style={{ minWidth: "1.8rem" }}
                          className="text-center"
                        >
                          {countPeople(
                            "FEMALE",
                            "ADULT",
                            personCharacteristics.FEMALE.activity,
                            personCharacteristics.FEMALE.isTraversing,
                            personCharacteristics.FEMALE.isPersonWithImpairment,
                            personCharacteristics.FEMALE
                              .isInApparentIllicitActivity,
                            personCharacteristics.FEMALE.isPersonWithoutHousing,
                          )}
                        </p>
                        <Button
                          isDisabled={submitting}
                          onPress={() => handlePersonAdd("FEMALE", "ADULT")}
                          className="h-8 w-8 text-3xl"
                          variant={"admin"}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <h6 className="text-xl font-semibold">Idosa</h6>
                      <div className="flex flex-row items-center gap-1">
                        <Button
                          isDisabled={submitting}
                          onPress={() =>
                            handlePersonRemoval("FEMALE", "ELDERLY")
                          }
                          className="h-8 w-8 text-3xl"
                          variant={"admin"}
                        >
                          -
                        </Button>
                        <p
                          style={{ minWidth: "1.8rem" }}
                          className="text-center"
                        >
                          {countPeople(
                            "FEMALE",
                            "ELDERLY",
                            personCharacteristics.FEMALE.activity,
                            personCharacteristics.FEMALE.isTraversing,
                            personCharacteristics.FEMALE.isPersonWithImpairment,
                            personCharacteristics.FEMALE
                              .isInApparentIllicitActivity,
                            personCharacteristics.FEMALE.isPersonWithoutHousing,
                          )}
                        </p>
                        <Button
                          isDisabled={submitting}
                          onPress={() => handlePersonAdd("FEMALE", "ELDERLY")}
                          className="h-8 w-8 text-3xl"
                          variant={"admin"}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <h4 className="text-2xl font-semibold">Dados complementares</h4>
              <div className="flex flex-col gap-5">
                <div className="flex flex-row gap-5">
                  <div className="flex flex-col items-center">
                    <h6 className="text-xl font-semibold">Pets</h6>
                    <div className="flex flex-row items-center gap-1">
                      <Button
                        isDisabled={submitting}
                        onPress={() => {
                          if (complementaryData.animalsAmount !== 0)
                            setComplementaryData((prev) => ({
                              ...prev,
                              animalsAmount: prev.animalsAmount - 1,
                            }));
                        }}
                        className="h-8 w-8 text-3xl"
                        variant={"admin"}
                      >
                        -
                      </Button>
                      <p style={{ minWidth: "1.8rem" }} className="text-center">
                        {complementaryData.animalsAmount}
                      </p>
                      <Button
                        isDisabled={submitting}
                        onPress={() =>
                          setComplementaryData((prev) => ({
                            ...prev,
                            animalsAmount: prev.animalsAmount + 1,
                          }))
                        }
                        className="h-8 w-8 text-3xl"
                        variant={"admin"}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <h6 className="text-xl font-semibold">Grupos</h6>
                    <div className="flex flex-row items-center gap-1">
                      <Button
                        isDisabled={submitting}
                        onPress={() => {
                          if (complementaryData.groupsAmount !== 0)
                            setComplementaryData((prev) => ({
                              ...prev,
                              groupsAmount: prev.groupsAmount - 1,
                            }));
                        }}
                        className="h-8 w-8 text-3xl"
                        variant={"admin"}
                      >
                        -
                      </Button>
                      <p style={{ minWidth: "1.8rem" }} className="text-center">
                        {complementaryData.groupsAmount}
                      </p>
                      <Button
                        isDisabled={submitting}
                        onPress={() =>
                          setComplementaryData((prev) => ({
                            ...prev,
                            groupsAmount: prev.groupsAmount + 1,
                          }))
                        }
                        className="h-8 w-8 text-3xl"
                        variant={"admin"}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-xl font-semibold">
                    Atividades comerciais itinerantes
                  </h4>
                  <div className="flex flex-row items-center gap-3">
                    <div>
                      <Select
                        onChange={(e) =>
                          setSelectedCommercialActivity(e.target.value)
                        }
                        name="commercial-activities"
                        id="commercial-activities"
                      >
                        {commercialActivitiesOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div
                      className="flex flex-row items-center"
                      style={{
                        opacity: selectedCommercialActivity !== "other" ? 1 : 0,
                      }}
                    >
                      <Button
                        variant={"admin"}
                        className="h-8 w-8 text-3xl"
                        isDisabled={
                          selectedCommercialActivity === "other" || submitting
                        }
                        onPress={() => {
                          const key = selectedCommercialActivity;
                          if (key === "other") return;
                          setCommercialActivities((prev) => {
                            const newObject = { ...prev };
                            if (newObject[selectedCommercialActivity]) {
                              newObject[selectedCommercialActivity] -= 1;
                            }
                            return newObject;
                          });
                        }}
                      >
                        -
                      </Button>
                      <p style={{ minWidth: "1.8rem" }} className="text-center">
                        {commercialActivities[selectedCommercialActivity] ?
                          commercialActivities[selectedCommercialActivity]
                        : 0}
                      </p>
                      <Button
                        variant={"admin"}
                        className="h-8 w-8 text-3xl"
                        isDisabled={
                          selectedCommercialActivity === "other" || submitting
                        }
                        onPress={() => {
                          const key = selectedCommercialActivity;
                          if (key === "other") return;
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
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  {selectedCommercialActivity === "other" ?
                    <React.Fragment>
                      <p>Nova atividade comercial itinerante: </p>
                      <form
                        action={(formdata: FormData) => {
                          let activity = formdata.get("activity") as string;
                          activity =
                            activity.trim().charAt(0).toUpperCase() +
                            activity.trim().slice(1);
                          if (
                            !activity ||
                            activity === "" ||
                            commercialActivitiesOptions.some(
                              (option) => option.value === activity,
                            )
                          )
                            return;
                          else
                            setCommercialActivitiesOptions((prev) => [
                              ...prev,
                              { value: activity, label: activity },
                            ]);
                        }}
                        className="flex flex-row items-center gap-1"
                      >
                        <Input
                          name="activity"
                          placeholder="Descrição da atividade itinerante"
                          onChange={(e) =>
                            setNewCommercialActivityInput(
                              e.target.value.trim().charAt(0).toUpperCase() +
                                e.target.value.trim().slice(1),
                            )
                          }
                        />
                        {(
                          commercialActivitiesOptions.some(
                            (option) =>
                              option.value ===
                              deferredNewCommercialActivityInput.trim(),
                          )
                        ) ?
                          <p>Adicionado!</p>
                        : <Button type="submit">Adicionar</Button>}
                      </form>
                    </React.Fragment>
                  : ""}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 overflow-auto rounded-3xl bg-gray-400/20 p-3 text-white shadow-inner">
          <h4 className="text-xl font-semibold">Acompanhamento</h4>
          <p>{`Data de início: ${tally.startDate.toLocaleString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", year: "2-digit" })}`}</p>
          <p>{`Horário de início: ${tally.startDate.toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}</p>
          <p>{`Observador: ${tally.observer}`}</p>
          <p>{`Temperatura: ${weatherStats.temperature}°C`}</p>
          <p>{`Tempo: ${weatherNameMap.get(weatherStats.weather)}`}</p>
          <label className="mr-1" htmlFor="end-date">
            Final:
          </label>
          <Input
            className={
              validEndDate ? "outline-none" : "outline outline-red-500"
            }
            onChange={(e) => {
              endDate = new Date(e.target.value);
            }}
            id="end-date"
            type="datetime-local"
          ></Input>

          <div className="flex flex-row gap-1">
            <Button
              className="w-24"
              isDisabled={submitting}
              onPress={() => {
                handleDataSubmit(false).catch((error) => console.log(error));
              }}
              variant={"secondary"}
            >
              {submitting ? "Salvando..." : "Salvar"}
            </Button>
            <Button
              variant={"constructive"}
              onPress={() => {
                handleDataSubmit(true).catch((error) => console.log(error));
              }}
            >
              {submittingAndEnding ? "Salvando" : "Salvar e finalizar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { OngoingTallyPage };
