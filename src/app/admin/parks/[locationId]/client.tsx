"use client";

import { Button } from "@/components/button";
import { FormInput } from "@/components/formInput";
import { zodErrorType } from "@/lib/zodValidators";
import { Location } from "@prisma/client";
import { redirect } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import {
  basicAnswerMap,
  basicAnswerSchema,
  extraAnswerMap,
  extraAnswerSchema,
} from "../../map/answerSchemas";

const Client = ({ location }: { location: Location }) => {
  if (location === null || location === undefined) redirect("/error");

  const [isReadOnly, setIsReadOnly] = useState(true);

  const [basicAnswerValues, setBasicAnswerValues] = useState<
    z.infer<typeof basicAnswerSchema>
  >({
    name: location.name,
    firstStreet: location.firstStreet,
    secondStreet: location.secondStreet,
  });
  const [basicErrorValues, setBasicErrorValues] = useState<zodErrorType<
    typeof basicAnswerSchema
  > | null>({});
  const checkBasicValidity = (key: keyof typeof basicAnswerValues) => {
    const result = basicAnswerSchema.safeParse(basicAnswerValues);

    if (result.success) {
      setBasicErrorValues(null);
    } else {
      const errors = result.error.flatten().fieldErrors;

      setBasicErrorValues({
        ...basicErrorValues,
        [key]: errors[key],
      });
    }
  };

  const [extraAnswerValues, setExtraAnswerValues] = useState<
    z.infer<typeof extraAnswerSchema>
  >({
    creationYear: (location.creationYear?.getFullYear() ?? "") + "",
    lastMaintenanceYear:
      (location.lastMaintenanceYear?.getFullYear() ?? "") + "",
    overseeingMayor: location.overseeingMayor ?? "",
    legislation: location.legislation ?? "",
    legalArea: (location.legalArea ?? "") + "",
    incline: (location.incline ?? "") + "",
  });
  const [extraErrorValues, setExtraErrorValues] = useState<zodErrorType<
    typeof extraAnswerSchema
  > | null>({});
  const checkExtraValidity = (key: keyof typeof extraAnswerValues) => {
    const result = extraAnswerSchema.safeParse(extraAnswerValues);

    if (result.success) {
      setExtraErrorValues(null);
    } else {
      const errors = result.error.flatten().fieldErrors;

      setExtraErrorValues({ ...extraErrorValues, [key]: errors[key] });
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden p-5">
      <h2 className="-mb-1 overflow-hidden overflow-ellipsis text-3xl font-bold text-white">
        {location.name}
      </h2>
      <div className="flex max-h-full basis-full pt-2">
        <div className="flex max-h-full max-w-[70%] basis-[70%] flex-col pr-5">
          <div className="flex max-h-full basis-full flex-col rounded-3xl bg-gray-300/30 text-white shadow-md">
            <div className="m-3 flex max-h-full flex-col overflow-clip">
              <div className="flex items-center">
                <h3 className="text-2xl font-semibold">Informações</h3>
                <Button
                  variant="admin"
                  className="ml-auto"
                  onPress={() => {
                    setIsReadOnly(!isReadOnly);
                  }}
                >
                  <span className="-mb-1">Editar</span>
                </Button>
              </div>

              <div className="flex max-h-full basis-full overflow-clip">
                <div className="flex max-w-[50%] basis-[50%] flex-col gap-2 pr-2">
                  {Object.entries(basicAnswerMap).map(([key, value]) => {
                    return (
                      <FormInput
                        key={key}
                        objectKey={value.label}
                        answerValues={basicAnswerValues}
                        setAnswerValues={setBasicAnswerValues}
                        errorValues={basicErrorValues}
                        checker={checkBasicValidity}
                        label={key}
                        description={value.description}
                        isReadOnly={isReadOnly}
                      />
                    );
                  })}
                </div>
                <div className="max-h-full max-w-[50%] basis-[50%] overflow-clip pl-2">
                  <div className="flex max-h-full flex-col gap-2 overflow-scroll">
                    {Object.entries(extraAnswerMap).map(([key, value]) => {
                      return (
                        <FormInput
                          key={key}
                          objectKey={value.label}
                          answerValues={extraAnswerValues}
                          setAnswerValues={setExtraAnswerValues}
                          errorValues={extraErrorValues}
                          checker={checkExtraValidity}
                          label={key}
                          description={value.description}
                          isReadOnly={isReadOnly}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[30%] basis-[30%] rounded-3xl bg-gray-300/30 shadow-md"></div>
      </div>
    </div>
  );
};

export { Client };
