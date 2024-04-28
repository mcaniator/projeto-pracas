"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createAnswer,
  createAssessment,
  createClassification,
  createForm,
  createSubclassification,
} from "@/serverActions/assessmentCRUD";
import {
  exportAllIndividualTallysToCsv,
  exportDailyTally,
  exportFullSpreadsheetToCSV,
  exportIndividualTallysToCSV,
} from "@/serverActions/exportToCSV";
import { createLocation } from "@/serverActions/locationCRUD";
import { createNoiseMeasurement } from "@/serverActions/noiseCRUD";
import { addPersonToTally, createTally } from "@/serverActions/tallyCRUD";
import { useState } from "react";

const ButtonWrapper = () => {
  const content = {
    name: "nome da praca",
    type: "PARK" as const,
    category: "OPEN_SPACE_FOR_COLLECTIVE_USE" as const,
    narrowAdministrativeUnit: "del1",
    intermediateAdministrativeUnit: "del2",
    broadAdministrativeUnit: "del4",
  };

  const startDate = new Date("December 17, 1995 03:24:00");
  const endDate = new Date("December 17, 1995 09:00:00");
  const [locationId, setLocationId] = useState(0);
  const [tallyId, setTallyId] = useState(0);

  const handleTallyCSVDownload = async () => {
    try {
      const blobStr = await exportDailyTally(
        [1, 2, 3, 4, 5],
        [10, 11, 12, 13, 14, 15, 16, 18, 19],
        ["id", "name", "date"],
      );
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
      const blobStr = await exportAllIndividualTallysToCsv(
        [1, 2, 3, 4, 5],
        ["name", "id", "date"],
      );
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
  const handleFullCSVDownload = async () => {
    try {
      const blobStr = await exportFullSpreadsheetToCSV(
        [1, 2, 3, 4, 5],
        [1, 2, 3, 4, 5],
        [2, 3, 4, 5, 7, 8, 9, 10],
        ["id", "name", "date"],
      );
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
              locationId: 2,
              observer: "Guilherme Pimenta",
              startDate: new Date("2024-04-23T18:07:00-03:00"),
              weatherCondition: "SUNNY",
              animalsAmount: 80,
              temperature: 19.4,
              tallyGroup: 2,
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
            void addPersonToTally(16, 100, {
              ageGroup: "CHILD",
              gender: "MALE",
              activity: "SEDENTARY",
              isTraversing: false,
              isPersonWithImpairment: false,
              isInApparentIllicitActivity: false,
              isPersonWithoutHousing: false,
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
              {
                assessmentId: 2,
                date: new Date("2024-03-25"),
                noiseType: "HUMAN",
                soundLevel: 70.5,
              },
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
          Baixar CSV das contagens em um dia
        </Button>
      </div>
      <div className="flex gap-2">
        <Button
          variant={"admin"}
          className="mb-[2px] self-end"
          type="button"
          onClick={handleAllTallyCSVDownload}
        >
          Baixar Todas as contagens em CSV
        </Button>
      </div>
      <div className="flex gap-2">
        <Button
          variant={"admin"}
          className="mb-[2px] self-end"
          type="submit"
          onClick={handleFullCSVDownload}
        >
          <span className="-mb-1">FULL CSV</span>
        </Button>
      </div>
      <div className="flex gap-2">
        <Button
          variant={"admin"}
          className="mb-[2px] self-end"
          type="submit"
          onClick={() => void createClassification("EVENTOS", ["Frequência"])}
        >
          Criar Classificação
        </Button>
      </div>
      <div className="flex gap-2">
        <Button
          variant={"admin"}
          className="mb-[2px] self-end"
          type="submit"
          onClick={() =>
            void createSubclassification("Nova tipo de vigilancia", 4, [
              "Questao v1",
              "Questao v2",
              "Questão v3",
            ])
          }
        >
          Criar subclassificação
        </Button>
      </div>
      <div className="flex gap-2">
        <Button
          variant={"admin"}
          className="mb-[2px] self-end"
          type="submit"
          onClick={() =>
            void createForm("Form 5", [4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 17])
          }
        >
          Criar form
        </Button>
      </div>
      <div className="flex gap-2">
        <div>
          <Button
            variant={"admin"}
            className="mb-[2px] self-end"
            type="submit"
            onClick={() =>
              void createAssessment(
                "Avaliação LOCATION 2",
                2,
                5,
                "R1D1",
                startDate,
                endDate,
              )
            }
          >
            Criar avaliação
          </Button>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() =>
            void createAnswer("Uso térreo residencial form 4", 14, 4, 1, 9, 8)
          }
        >
          Criar resposta
        </Button>
      </div>
    </div>
  );
};

export { ButtonWrapper };
