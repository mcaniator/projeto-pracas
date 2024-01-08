"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { locationType } from "@/lib/zodValidators";
import { createLocation, fetchLocation } from "@/serverActions/locationCRUD";
import { addPersonToTally, createTally } from "@/serverActions/tallyCRUD";
import { use, useState } from "react";

const ButtonWrapper = () => {
  const content: locationType = {
    name: "nome da praca",
    type: "PARK",
    category: "OPEN_SPACE_FOR_NON_COLLECTIVE_USE",
  };

  const fetchId = 5;

  const [locationId, setLocationId] = useState(0);
  const [tallyId, setTallyId] = useState(0);

  return (
    <div className="ml-5 flex flex-col gap-5 text-white">
      <div>
        <p>Criação de Locais:</p>
        <div className="flex gap-2">
          <Button variant="admin" onClick={() => (content.name = "praça são mateus")}>
            <span className="-mb-1">Mudar nome</span>
          </Button>
          <Button variant="admin" onClick={() => use(createLocation(content))}>
            <span className="-mb-1">Cadastrar</span>
          </Button>
        </div>
      </div>

      <div>
        <p>Consulta de Locais:</p>
        <Button variant="admin" onClick={() => console.log(fetchLocation(fetchId))}>
          <span className="-mb-1">Consultar</span>
        </Button>
      </div>

      <div className="flex gap-2">
        <div>
          <label htmlFor="locationId">ID da praça para a contagem: </label>
          <Input
            type="number"
            id="locationId"
            name="Location ID Input"
            onChange={(e) => setLocationId(parseInt(e.target.value))}
            value={locationId}
          />
        </div>
        <Button
          variant={"admin"}
          className="mb-[2px] self-end"
          type="submit"
          onClick={() => use(createTally({ locationId: locationId, animalsAmount: 0, temperature: 30.0 }, []))}
        >
          <span className="-mb-1">Adicionar contagem</span>
        </Button>
      </div>

      <div className="flex gap-2">
        <div>
          <label htmlFor="tallyId">ID da contagem:</label>
          <Input type="number" id="tallyId" name="Tally ID Input" onChange={(e) => setTallyId(parseInt(e.target.value))} value={tallyId} />
        </div>
        <Button
          variant={"admin"}
          className="mb-[2px] self-end"
          type="submit"
          onClick={() =>
            use(
              addPersonToTally({
                ageGroup: "CHILD",
                sex: "MALE",
                activity: "WALKING",
                isTraversing: true,
                isImpairedPerson: true,
                isInApparentIllicitActivity: false,
                isPersonWithoutHousing: false,
                tallyId: tallyId,
              }),
            )
          }
        >
          <span className="-mb-1">Adicionar pessoa</span>
        </Button>
      </div>
    </div>
  );
};

export { ButtonWrapper };
