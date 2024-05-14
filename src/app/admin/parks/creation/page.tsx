"use client";

import { createLocation } from "@/serverActions/locationCRUD";
import { addPersonToTally, createTally } from "@/serverActions/tallyCRUD";
import { useState } from "react";

const Page = ({ params }: { params: { locationId: string } }) => {
  const [time, setTime] = useState(1715649125000);
  const createTallyHandler = async () => {
    await createTally({
      locationId: 1,
      observer: "Guilherme Pimenta",
      startDate: new Date(time),
      weatherCondition: "CLOUDY",
    });
    setTime(time + 10000000000);
  };
  return (
    <div>
      <button onClick={createTallyHandler}>Criar contagem</button>
      <button
        onClick={
          void addPersonToTally(1, 1, {
            ageGroup: "ADULT",
            gender: "MALE",
            activity: "SEDENTARY",
            isTraversing: false,
            isInApparentIllicitActivity: false,
            isPersonWithImpairment: false,
            isPersonWithoutHousing: false,
          })
        }
      >
        Adicionar pessoa
      </button>
    </div>
  );
};

export default Page;
