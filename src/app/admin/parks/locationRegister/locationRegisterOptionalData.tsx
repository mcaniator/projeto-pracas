"use client";

import {
  IconArrowBackUp,
  IconDeviceFloppy,
  IconHelp,
} from "@tabler/icons-react";
import { useState } from "react";

import { Button } from "../../../../components/button";
import { Checkbox } from "../../../../components/ui/checkbox";
import { Input } from "../../../../components/ui/input";
import { ParkData } from "./locationRegisterForm";

const LocationRegisterOptionalData = ({
  parkData,
  goToPreviousPage,
  setParkData,
  handleSubmit,
}: {
  parkData: ParkData;
  goToPreviousPage: () => void;
  setParkData: React.Dispatch<React.SetStateAction<ParkData>>;
  handleSubmit: () => void;
}) => {
  const [showHelp, setShowHelp] = useState(false);
  return (
    <div className="flex w-full max-w-[70rem] flex-col">
      <h3>Informações extras (opcional)</h3>
      <label htmlFor={"notes"}>Notas:</label>
      <Input
        value={parkData.notes ?? ""}
        type="text"
        name="notes"
        id={"notes"}
        className="w-full"
        onChange={(e) =>
          setParkData((prev) => ({
            ...prev,
            notes: e.target.value.trim() === "" ? null : e.target.value,
          }))
        }
      />

      <label htmlFor={"creationYear"} className="mt-3">
        Data de Criação:
      </label>
      <Input
        className="w-full"
        type="date"
        name="creationYear"
        id={"creationYear"}
        onChange={(e) =>
          setParkData((prev) => ({
            ...prev,
            creationYear: e.target.value.trim() === "" ? null : e.target.value,
          }))
        }
      />

      <label htmlFor={"lastMaintenanceYear"} className="mt-3">
        Data da Última Manutenção:
      </label>
      <Input
        className="w-full"
        type="date"
        name="lastMaintenanceYear"
        id={"lastMaintenanceYear"}
        onChange={(e) =>
          setParkData((prev) => ({
            ...prev,
            lastMaintenanceYear:
              e.target.value.trim() === "" ? null : e.target.value,
          }))
        }
      />

      <label htmlFor={"overseeingMayor"} className="mt-3">
        Prefeito Inaugurador:
      </label>
      <Input
        className="w-full"
        type="text"
        name="overseeingMayor"
        id={"overseeingMayor"}
        onChange={(e) =>
          setParkData((prev) => ({
            ...prev,
            overseeingMayor:
              e.target.value.trim() === "" ? null : e.target.value,
          }))
        }
      />

      <label htmlFor={"legislation"} className="mt-3">
        Legislação:
      </label>
      <Input
        className="w-full"
        type="text"
        name="legislation"
        id={"legislation"}
        onChange={(e) =>
          setParkData((prev) => ({
            ...prev,
            legislation: e.target.value.trim() === "" ? null : e.target.value,
          }))
        }
      />

      <label htmlFor={"usableArea"} className="mt-3">
        Área Útil(m²):
      </label>
      <Input
        className="w-full"
        type="number"
        name="usableArea"
        id={"usableArea"}
        onChange={(e) =>
          setParkData((prev) => ({
            ...prev,
            usableArea: e.target.value.trim() === "" ? null : e.target.value,
          }))
        }
      />

      <label htmlFor={"legalArea"} className="mt-3">
        Área Prefeitura(m²):
      </label>
      <Input
        className="w-full"
        type="number"
        name="legalArea"
        id={"legalArea"}
        onChange={(e) =>
          setParkData((prev) => ({
            ...prev,
            legalArea: e.target.value.trim() === "" ? null : e.target.value,
          }))
        }
      />

      <label htmlFor={"incline"} className="mt-3">
        Inclinação:
      </label>
      <Input
        className="w-full"
        type="number"
        name="incline"
        id={"incline"}
        onChange={(e) =>
          setParkData((prev) => ({
            ...prev,
            incline: e.target.value.trim() === "" ? null : e.target.value,
          }))
        }
      />

      <div className="mt-3 flex gap-9">
        <Checkbox name="isPark" id={"isPark"}>
          É Praça:
        </Checkbox>

        <Checkbox name="inactiveNotFound" id={"inactiveNotFound"}>
          Inativo ou não encontrado
        </Checkbox>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center">
          <label htmlFor="file">Importar arquivo shapefile:</label>
          <Button
            variant={"ghost"}
            className="group relative"
            onPress={() => setShowHelp((prev) => !prev)}
          >
            <IconHelp />
            <div
              className={`absolute -left-48 -top-10 w-[75vw] max-w-[220px] rounded-lg bg-black px-3 py-1 text-sm text-white shadow-md transition-opacity duration-200 sm:w-[25vw] ${showHelp ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
            >
              Suporta arquivo shapefile com codificação SRID 4326
            </div>
          </Button>
        </div>
        <input type="file" name="file" id="file" accept=".shp" />
      </div>
      <div className="mt-3 flex">
        <Button onPress={goToPreviousPage}>
          <IconArrowBackUp />
        </Button>
        <Button
          variant={"constructive"}
          className="ml-auto"
          onPress={handleSubmit}
        >
          <IconDeviceFloppy />
        </Button>
      </div>
    </div>
  );
};

export default LocationRegisterOptionalData;
