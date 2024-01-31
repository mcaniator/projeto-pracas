"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPolygonFromShp } from "@/serverActions/getPolygonFromShp";
import { createLocation } from "@/serverActions/locationCRUD";
import { createNoiseMeasurement } from "@/serverActions/noiseCRUD";
import { addPersonToTally, createTally } from "@/serverActions/tallyCRUD";
import { useState } from "react";

const ButtonWrapper = () => {
  const content = {
    name: "nome da praca",
    type: "PARK" as const,
    category: "OPEN_SPACE_FOR_NON_COLLECTIVE_USE" as const,
    administrativeDelimitation1: "del1",
    administrativeDelimitation2: "del2",
    administrativeDelimitation3: "del4",
  };

  const [locationId, setLocationId] = useState(0);
  const [tallyId, setTallyId] = useState(0);

  return (
    <div className="ml-5 flex flex-col gap-5 text-white">
      <div>
        <p>Criação de Locais:</p>
        <div className="flex gap-2">
          <Button
            variant="admin"
            onClick={() => (content.name = "praça são mateus")}
          >
            <span className="-mb-1">Mudar nome</span>
          </Button>
          <Button
            variant="admin"
            onClick={() =>
              void createLocation(
                content,
                2,
                "(((-71.1031880899493 42.3152774590236,-71.1031627617667 42.3152960829043,-71.102923838298 42.3149156848307,-71.1023097974109 42.3151969047397,-71.1019285062273 42.3147384934248,-71.102505233663 42.3144722937587,-71.10277487471 42.3141658254797,-71.103113945163 42.3142739188902,-71.10324876416 42.31402489987,-71.1033002961013 42.3140393340215,-71.1033488797549 42.3139495090772,-71.103396240451 42.3138632439557,-71.1041521907712 42.3141153348029,-71.1041411411543 42.3141545014533,-71.1041287795912 42.3142114839058,-71.1041188134329 42.3142693656241,-71.1041112482575 42.3143272556118,-71.1041072845732 42.3143851580048,-71.1041057218871 42.3144430686681,-71.1041065602059 42.3145009876017,-71.1041097995362 42.3145589148055,-71.1041166403905 42.3146168544148,-71.1041258822717 42.3146748022936,-71.1041375307579 42.3147318674446,-71.1041492906949 42.3147711126569,-71.1041598612795 42.314808571739,-71.1042515013869 42.3151287620809,-71.1041173835118 42.3150739481917,-71.1040809891419 42.3151344119048,-71.1040438678912 42.3151191367447,-71.1040194562988 42.3151832057859,-71.1038734225584 42.3151140942995,-71.1038446938243 42.3151006300338,-71.1038315271889 42.315094347535,-71.1037393329282 42.315054824985,-71.1035447555574 42.3152608696313,-71.1033436658644 42.3151648370544,-71.1032580383161 42.3152269126061,-71.103223066939 42.3152517403219,-71.1031880899493 42.3152774590236)),((-71.1043632495873 42.315113108546,-71.1043583974082 42.3151211109857,-71.1043443253471 42.3150676015829,-71.1043850704575 42.3150793250568,-71.1043632495873 42.315113108546)))",
              )
            }
          >
            <span className="-mb-1">Cadastrar</span>
          </Button>
        </div>
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
          onClick={() =>
            void createTally({
              locationId: locationId,
              animalsAmount: 0,
              temperature: 30.0,
            })
          }
        >
          <span className="-mb-1">Adicionar contagem</span>
        </Button>
      </div>

      <div className="flex gap-2">
        <div>
          <label htmlFor="tallyId">ID da contagem:</label>
          <Input
            type="number"
            id="tallyId"
            name="Tally ID Input"
            onChange={(e) => setTallyId(parseInt(e.target.value))}
            value={tallyId}
          />
        </div>
        <Button
          variant={"admin"}
          className="mb-[2px] self-end"
          type="submit"
          onClick={() =>
            void addPersonToTally(tallyId, [
              {
                ageGroup: "ADULT",
                gender: "MALE",
                activity: "SEDENTARY",
                isTraversing: true,
                isPersonWithImpairment: true,
                isInApparentIllicitActivity: true,
                isPersonWithoutHousing: true,
                tallyId: tallyId,
              },
            ])
          }
        >
          <span className="-mb-1">Adicionar pessoa</span>
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          variant={"admin"}
          className="mb-[2px] self-end"
          type="submit"
          onClick={() =>
            void createNoiseMeasurement(
              { assessmentId: 1, location: "CENTER", soundLevel: 70.5 },
              { x: 266, y: 1530 },
            )
          }
        >
          <span className="-mb-1">Adicionar ruído</span>
        </Button>
      </div>
      <div className="flex gap-2">
        <form action={getPolygonFromShp}>
          <p>
            <label htmlFor="shpFile">Enviar arquivo shapefile: </label>
            <input id="shpFile" name="shpFile" type="file" accept=".shp" />
          </p>
          <Button variant={"admin"} className="mb-[2px] self-end" type="submit">
            Enviar
          </Button>
        </form>
      </div>
    </div>
  );
};

export { ButtonWrapper };
