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
                "(((-43.355816149775855 -21.721832330906338 0, -43.355847481388246 -21.72218661913868 0, -43.356278893589526 -21.722097444549586 0, -43.35638734917085 -21.721762437309483 0, -43.35623551135699 -21.72153829577474 0, -43.35605475205478 -21.721509374286384 0, -43.35580891940377 -21.721598548875477 0, -43.355816149775855 -21.721832330906338 0)), ((-43.3553590650576 -21.72139758374319 0, -43.35508312274298 -21.7213886385493 0, -43.35489944516949 -21.72147340287196 0, -43.3547905948686 -21.72174010368484 0, -43.35492953878133 -21.7220652380782 0, -43.35519183199391 -21.72215069681387 0, -43.35540947602813 -21.72208843954329 0, -43.35557879969165 -21.72175449335225 0, -43.3553590650576 -21.72139758374319 0),(-43.355302793357566 -21.72157324257317 0, -43.355360636334275 -21.721722670263002 0, -43.35519915802429 -21.721804614480007 0, -43.35515216060572 -21.72168892852659 0, -43.35518710740415 -21.721606984309584 0, -43.355302793357566 -21.72157324257317 0),(-43.35535943127226 -21.72187330301484 0, -43.355395583132704 -21.721943196611697 0, -43.35532809965988 -21.721973323162064 0, -43.35535943127226 -21.72187330301484 0),(-43.355023218970146 -21.72176966768157 0, -43.35515336566774 -21.7218781232629 0, -43.355179877032064 -21.722001039588406 0, -43.35510034293909 -21.72202032058064 0, -43.35503285946626 -21.72202996107676 0, -43.354982246861645 -21.721988988968256 0, -43.355023218970146 -21.72176966768157 0)))",
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
