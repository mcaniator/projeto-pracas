"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  exportAllTallysToCsv,
  exportTallyToCSV,
  exportToCSV,
} from "@/serverActions/exportToCSV";
import { createLocation } from "@/serverActions/locationCRUD";
import { createNoiseMeasurement } from "@/serverActions/noiseCRUD";
import { addPersonToTally, createTally } from "@/serverActions/tallyCRUD";
import { useState } from "react";

const ButtonWrapper = () => {
  const content = {
    name: "nome da praca",
    type: "PARK" as const,
    category: "OPEN_SPACE_FOR_NON_COLLECTIVE_USE" as const,
    narrowAdministrativeUnit: "del1",
    intermediateAdministrativeUnit: "del2",
    broadAdministrativeUnit: "del4",
  };

  const [locationId, setLocationId] = useState(0);
  const [tallyId, setTallyId] = useState(0);

  const handleTallyCSVDownload = async () => {
    try {
      const blobStr = await exportTallyToCSV([10, 11, 12, 13, 14]);
      const blobData = new Blob([blobStr]);
      const url = URL.createObjectURL(blobData);
      const a = document.createElement("a");
      a.href = url;
      a.download = "export.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };
  const handleAllTallyCSVDownload = async () => {
    try {
      const blobStr = await exportAllTallysToCsv([1, 2, 3, 4, 5]);
      const blobData = new Blob([blobStr]);
      const url = URL.createObjectURL(blobData);
      const a = document.createElement("a");
      a.href = url;
      a.download = "export.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };
  const handleLocationSubmit = (e: FormData) => {
    void createLocation(
      content,
      {
        narrowAdministrativeUnit: "del1.3",
        intermediateAdministrativeUnit: "del2.4",
        broadAdministrativeUnit: "del4.3",
      },
      1,
      "null",
      e,
    );
  };

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
              weatherCondition: "SUNNY",
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
            void addPersonToTally(tallyId, 2, {
              ageGroup: "ADULT",
              gender: "MALE",
              activity: "SEDENTARY",
              isTraversing: true,
              isPersonWithImpairment: true,
              isInApparentIllicitActivity: false,
              isPersonWithoutHousing: true,
            })
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
        <form action={handleLocationSubmit}>
          <p>
            <label htmlFor="shpFile">Enviar arquivo shapefile: </label>
            <input id="shpFile" name="shpFile" type="file" accept=".shp" />
          </p>
          <Button variant={"admin"} className="mb-[2px] self-end" type="submit">
            Cadastrar local
          </Button>
        </form>
      </div>
      <div>
        <Button
          variant={"admin"}
          className="mb-[2px] self-end"
          type="button"
          onClick={handleTallyCSVDownload}
        >
          Baixar CSV das contagens
        </Button>
      </div>
      <div>
        <Button
          variant={"admin"}
          className="mb-[2px] self-end"
          type="button"
          onClick={handleAllTallyCSVDownload}
        >
          Baixar Todas as contagens em CSV
        </Button>
      </div>
    </div>
  );
};

export { ButtonWrapper };
