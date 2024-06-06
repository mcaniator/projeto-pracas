"use client";

import { Button } from "@/components/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { tallyDataFetchedToOngoingTallyPageType } from "@/lib/zodValidators";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import React from "react";

const OngoingTallyPage = ({
  tally,
}: {
  tally: tallyDataFetchedToOngoingTallyPageType;
}) => {
  const [tallyMap, setTallyMap] = useState<Map<string, number>>(new Map());
  const [commercialActivitiesMap, setCommercialActivitiesMap] = useState<
    Map<string, number>
  >(new Map());
  const [selectedCommercialActivity, setSelectedCommercialActivity] =
    useState("Alimentos");
  const [animalsAmount, setAnimalsAmount] = useState(0);
  const [groupsAmount, setGroupsAmount] = useState(0);
  const [manActivity, setManActivity] = useState("sedentary");
  const [womanActivity, setWomanActivity] = useState("sedentary");
  const [manTraversing, setManTraversing] = useState(false);
  const [manWithImpairment, setManWithImpairment] = useState(false);
  const [manInApparentIllicitActivity, setManInApparentIllicitActivity] =
    useState(false);
  const [manWithoutHousing, setManWithoutHousing] = useState(false);
  const [womanTraversing, setWomanTraversing] = useState(false);
  const [womanWithImpairment, setWomanWithImpairment] = useState(false);
  const [womanInApparentIllicitActivity, setWomanInApparentIllicitActivity] =
    useState(false);
  const [womanWithoutHousing, setWomanWithoutHousing] = useState(false);
  const [commercialActivitiesOptions, setCommercialActivitiesOptions] =
    useState([
      { value: "Alimentos", label: "Alimentos" },
      { value: "Produtos", label: "Produtos" },
      {
        value: "Pula-pula (ou outra ativ. infantil)",
        label: "Pula-pula (ou outra ativ. infantil)",
      },
      { value: "Mesas de bares", label: "Mesas de bares" },
      { value: "other", label: "Outros" },
    ]);
  const [newCommercialActivityInput, setNewCommercialActivityInput] =
    useState("");
  const deferredNewCommercialActivityInput = useDeferredValue(
    newCommercialActivityInput,
  );
  const handlePersonAdd = (gender: string, ageGroup: string) => {
    const key =
      gender === "male" ?
        `${gender}-${ageGroup}-${manActivity}-${manTraversing}-${manWithImpairment}-${manInApparentIllicitActivity}-${manWithoutHousing}`
      : `${gender}-${ageGroup}-${womanActivity}-${womanTraversing}-${womanWithImpairment}-${womanInApparentIllicitActivity}-${womanWithoutHousing}`;

    setTallyMap((prev) => {
      const newMap = new Map(prev);
      const prevValue = newMap.get(key) || 0;
      newMap.set(key, prevValue + 1);
      return newMap;
    });
  };
  const handlePersonRemoval = (gender: string, ageGroup: string) => {
    const key =
      gender === "male" ?
        `${gender}-${ageGroup}-${manActivity}-${manTraversing}-${manWithImpairment}-${manInApparentIllicitActivity}-${manWithoutHousing}`
      : `${gender}-${ageGroup}-${womanActivity}-${womanTraversing}-${womanWithImpairment}-${womanInApparentIllicitActivity}-${womanWithoutHousing}`;

    setTallyMap((prev) => {
      const newMap = new Map(prev);
      const prevValue = newMap.get(key);
      if (prevValue) {
        if (prevValue - 1 === 0) newMap.delete(key);
        else newMap.set(key, prevValue - 1);
      }
      return newMap;
    });
  };
  useEffect(() => {
    console.log(tallyMap);
  }, [tallyMap]);
  useEffect(() => {
    console.log(commercialActivitiesMap);
  }, [commercialActivitiesMap]);
  const countPeople = (
    gender: string,
    ageGroup: string,
    activity: string,
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
          <div className="flex flex-col gap-5">
            <div className="flex flex-col">
              <h4 className="text-2xl font-semibold">Pessoas</h4>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <h5 className="text-xl font-semibold">Homens</h5>
                  <div>
                    <div className="inline-flex w-auto gap-1 rounded-xl bg-gray-400/20 py-1 text-white shadow-inner">
                      <button
                        onClick={() => setManActivity("sedentary")}
                        className={`rounded-xl px-4 py-1 ${manActivity === "sedentary" ? "bg-gray-200/20 shadow-md" : "bg-gray-500/0"}`}
                      >
                        Sedentário
                      </button>
                      <button
                        onClick={() => setManActivity("walking")}
                        className={`rounded-xl bg-blue-500 px-4 py-1 ${manActivity === "walking" ? "bg-gray-200/20 shadow-md" : "bg-gray-500/0"}`}
                      >
                        Caminhando
                      </button>
                      <button
                        onClick={() => setManActivity("strenuous")}
                        className={`rounded-xl bg-blue-500 px-4 py-1 ${manActivity === "strenuous" ? "bg-gray-200/20 shadow-md" : "bg-gray-500/0"}`}
                      >
                        Vigoroso
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-row gap-2 py-1">
                    <Checkbox
                      onChange={(e) => setManTraversing(e.target.checked)}
                      variant={"admin"}
                    >
                      Passando
                    </Checkbox>
                    <Checkbox
                      onChange={(e) => setManWithImpairment(e.target.checked)}
                      variant={"admin"}
                    >
                      Deficiente
                    </Checkbox>
                    <Checkbox
                      onChange={(e) =>
                        setManInApparentIllicitActivity(e.target.checked)
                      }
                      variant={"admin"}
                    >
                      Atividade ilícita
                    </Checkbox>
                    <Checkbox
                      onChange={(e) => setManWithoutHousing(e.target.checked)}
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
                          onPress={() => handlePersonRemoval("male", "child")}
                          className="h-8 w-8 text-5xl"
                          variant={"admin"}
                        >
                          -
                        </Button>
                        <p
                          style={{ minWidth: "1.8rem" }}
                          className="text-center"
                        >
                          {countPeople(
                            "male",
                            "child",
                            manActivity,
                            manTraversing,
                            manWithImpairment,
                            manInApparentIllicitActivity,
                            manWithoutHousing,
                          )}
                        </p>
                        <Button
                          onPress={() => handlePersonAdd("male", "child")}
                          className="h-8 w-8 text-5xl"
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
                          onPress={() => handlePersonRemoval("male", "teen")}
                          className="h-8 w-8 text-5xl"
                          variant={"admin"}
                        >
                          -
                        </Button>
                        <p
                          style={{ minWidth: "1.8rem" }}
                          className="text-center"
                        >
                          {countPeople(
                            "male",
                            "teen",
                            manActivity,
                            manTraversing,
                            manWithImpairment,
                            manInApparentIllicitActivity,
                            manWithoutHousing,
                          )}
                        </p>
                        <Button
                          onPress={() => handlePersonAdd("male", "teen")}
                          className="h-8 w-8 text-5xl"
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
                          onPress={() => handlePersonRemoval("male", "adult")}
                          className="h-8 w-8 text-5xl"
                          variant={"admin"}
                        >
                          -
                        </Button>
                        <p
                          style={{ minWidth: "1.8rem" }}
                          className="text-center"
                        >
                          {countPeople(
                            "male",
                            "adult",
                            manActivity,
                            manTraversing,
                            manWithImpairment,
                            manInApparentIllicitActivity,
                            manWithoutHousing,
                          )}
                        </p>
                        <Button
                          onPress={() => handlePersonAdd("male", "adult")}
                          className="h-8 w-8 text-5xl"
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
                          onPress={() => handlePersonRemoval("male", "elderly")}
                          className="h-8 w-8 text-5xl"
                          variant={"admin"}
                        >
                          -
                        </Button>
                        <p
                          style={{ minWidth: "1.8rem" }}
                          className="text-center"
                        >
                          {countPeople(
                            "male",
                            "elderly",
                            manActivity,
                            manTraversing,
                            manWithImpairment,
                            manInApparentIllicitActivity,
                            manWithoutHousing,
                          )}
                        </p>
                        <Button
                          onPress={() => handlePersonAdd("male", "elderly")}
                          className="h-8 w-8 text-5xl"
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
                      <button
                        onClick={() => setWomanActivity("sedentary")}
                        className={`rounded-xl px-4 py-1 ${womanActivity === "sedentary" ? "bg-gray-200/20 shadow-md" : "bg-gray-500/0"}`}
                      >
                        Sedentária
                      </button>
                      <button
                        onClick={() => setWomanActivity("walking")}
                        className={`rounded-xl bg-blue-500 px-4 py-1 ${womanActivity === "walking" ? "bg-gray-200/20 shadow-md" : "bg-gray-500/0"}`}
                      >
                        Caminhando
                      </button>
                      <button
                        onClick={() => setWomanActivity("strenuous")}
                        className={`rounded-xl bg-blue-500 px-4 py-1 ${womanActivity === "strenuous" ? "bg-gray-200/20 shadow-md" : "bg-gray-500/0"}`}
                      >
                        Vigorosa
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-row gap-2 py-1">
                    <Checkbox
                      onChange={(e) => setWomanTraversing(e.target.checked)}
                      variant={"admin"}
                    >
                      Passando
                    </Checkbox>
                    <Checkbox
                      onChange={(e) => setWomanWithImpairment(e.target.checked)}
                      variant={"admin"}
                    >
                      Deficiente
                    </Checkbox>
                    <Checkbox
                      onChange={(e) =>
                        setWomanInApparentIllicitActivity(e.target.checked)
                      }
                      variant={"admin"}
                    >
                      Atividade ilícita
                    </Checkbox>
                    <Checkbox
                      onChange={(e) => setWomanWithoutHousing(e.target.checked)}
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
                          onPress={() => handlePersonRemoval("female", "child")}
                          className="h-8 w-8 text-5xl"
                          variant={"admin"}
                        >
                          -
                        </Button>
                        <p
                          style={{ minWidth: "1.8rem" }}
                          className="text-center"
                        >
                          {countPeople(
                            "female",
                            "child",
                            womanActivity,
                            womanTraversing,
                            womanWithImpairment,
                            womanInApparentIllicitActivity,
                            womanWithoutHousing,
                          )}
                        </p>
                        <Button
                          onPress={() => handlePersonAdd("female", "child")}
                          className="h-8 w-8 text-5xl"
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
                          onPress={() => handlePersonRemoval("female", "teen")}
                          className="h-8 w-8 text-5xl"
                          variant={"admin"}
                        >
                          -
                        </Button>
                        <p
                          style={{ minWidth: "1.8rem" }}
                          className="text-center"
                        >
                          {countPeople(
                            "female",
                            "teen",
                            womanActivity,
                            womanTraversing,
                            womanWithImpairment,
                            womanInApparentIllicitActivity,
                            womanWithoutHousing,
                          )}
                        </p>
                        <Button
                          onPress={() => handlePersonAdd("female", "teen")}
                          className="h-8 w-8 text-5xl"
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
                          onPress={() => handlePersonRemoval("female", "adult")}
                          className="h-8 w-8 text-5xl"
                          variant={"admin"}
                        >
                          -
                        </Button>
                        <p
                          style={{ minWidth: "1.8rem" }}
                          className="text-center"
                        >
                          {countPeople(
                            "female",
                            "adult",
                            womanActivity,
                            womanTraversing,
                            womanWithImpairment,
                            womanInApparentIllicitActivity,
                            womanWithoutHousing,
                          )}
                        </p>
                        <Button
                          onPress={() => handlePersonAdd("female", "adult")}
                          className="h-8 w-8 text-5xl"
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
                          onPress={() =>
                            handlePersonRemoval("female", "elderly")
                          }
                          className="h-8 w-8 text-5xl"
                          variant={"admin"}
                        >
                          -
                        </Button>
                        <p
                          style={{ minWidth: "1.8rem" }}
                          className="text-center"
                        >
                          {countPeople(
                            "female",
                            "elderly",
                            womanActivity,
                            womanTraversing,
                            womanWithImpairment,
                            womanInApparentIllicitActivity,
                            womanWithoutHousing,
                          )}
                        </p>
                        <Button
                          onPress={() => handlePersonAdd("female", "elderly")}
                          className="h-8 w-8 text-5xl"
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
                        onPress={() => {
                          if (animalsAmount !== 0)
                            setAnimalsAmount((prev) => prev - 1);
                        }}
                        className="h-8 w-8 text-5xl"
                        variant={"admin"}
                      >
                        -
                      </Button>
                      <p style={{ minWidth: "1.8rem" }} className="text-center">
                        {animalsAmount}
                      </p>
                      <Button
                        onPress={() => setAnimalsAmount((prev) => prev + 1)}
                        className="h-8 w-8 text-5xl"
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
                        onPress={() => {
                          if (groupsAmount !== 0)
                            setGroupsAmount((prev) => prev - 1);
                        }}
                        className="h-8 w-8 text-5xl"
                        variant={"admin"}
                      >
                        -
                      </Button>
                      <p style={{ minWidth: "1.8rem" }} className="text-center">
                        {groupsAmount}
                      </p>
                      <Button
                        onPress={() => setGroupsAmount((prev) => prev + 1)}
                        className="h-8 w-8 text-5xl"
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
                  <div className="flex flex-row items-center gap-8">
                    <div>
                      <Select
                        onChange={(e) =>
                          setSelectedCommercialActivity(e.target.value)
                        }
                        name="commercial-activities"
                        id="commercial-activities"
                        className="text-black"
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
                        className="h-8 w-8"
                        isDisabled={selectedCommercialActivity === "other"}
                        onPress={() => {
                          const key = selectedCommercialActivity;
                          if (key === "other") return;
                          setCommercialActivitiesMap((prev) => {
                            const newMap = new Map(prev);
                            const prevValue = newMap.get(key);
                            if (prevValue) {
                              if (prevValue - 1 === 0) newMap.delete(key);
                              else newMap.set(key, prevValue - 1);
                            }
                            return newMap;
                          });
                        }}
                      >
                        -
                      </Button>
                      <p style={{ minWidth: "1.8rem" }} className="text-center">
                        {(
                          commercialActivitiesMap.get(
                            selectedCommercialActivity,
                          )
                        ) ?
                          commercialActivitiesMap.get(
                            selectedCommercialActivity,
                          )
                        : 0}
                      </p>
                      <Button
                        variant={"admin"}
                        className="h-8 w-8"
                        isDisabled={selectedCommercialActivity === "other"}
                        onPress={() => {
                          const key = selectedCommercialActivity;
                          if (key === "other") return;
                          setCommercialActivitiesMap((prev) => {
                            const newMap = new Map(prev);
                            const prevValue = newMap.get(key) || 0;
                            newMap.set(key, prevValue + 1);
                            return newMap;
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
                          activity = activity.trim();
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
                            setNewCommercialActivityInput(e.target.value)
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

        <div className="flex flex-col gap-1 rounded-3xl bg-gray-400/20 p-3 text-white shadow-inner">
          <h4 className="text-xl font-semibold">Acompanhamento</h4>
        </div>
      </div>
    </div>
  );
};

export { OngoingTallyPage };
