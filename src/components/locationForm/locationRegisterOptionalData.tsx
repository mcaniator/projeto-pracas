"use client";

import {
  IconArrowBackUp,
  IconDeviceFloppy,
  IconHelp,
} from "@tabler/icons-react";
import { useState } from "react";

import { Button } from "../button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { ParkData } from "./locationRegisterForm";

const LocationRegisterOptionalData = ({
  parkData,
  shapefile,
  goToPreviousPage,
  setParkData,
  handleSubmit,
  setShapefile,
}: {
  parkData: ParkData;
  shapefile: { file: Blob; name: string } | undefined;
  goToPreviousPage: () => void;
  setParkData: React.Dispatch<React.SetStateAction<ParkData>>;
  handleSubmit: () => void;
  setShapefile: React.Dispatch<
    React.SetStateAction<{ file: Blob; name: string } | undefined>
  >;
}) => {
  const [showHelp, setShowHelp] = useState(false);
  return (
    <div className="flex w-full max-w-[70rem] flex-col">
      <h3>Informações extras (opcional)</h3>
      <label htmlFor={"notes"}>Observações:</label>
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
        value={parkData.creationYear?.split("T")[0] ?? ""}
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
        value={parkData.lastMaintenanceYear?.split("T")[0] ?? ""}
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
        value={parkData.overseeingMayor ?? ""}
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
        value={parkData.legislation ?? ""}
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
        value={parkData.usableArea ?? " "}
        onChange={(e) => {
          setParkData((prev) => ({
            ...prev,
            usableArea: e.target.value === "" ? null : e.target.value,
          }));
        }}
      />

      <label htmlFor={"legalArea"} className="mt-3">
        Área Prefeitura(m²):
      </label>
      <Input
        className="w-full"
        type="number"
        name="legalArea"
        id={"legalArea"}
        value={parkData.legalArea ?? " "}
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
        value={parkData.incline ?? " "}
        onChange={(e) =>
          setParkData((prev) => ({
            ...prev,
            incline: e.target.value.trim() === "" ? null : e.target.value,
          }))
        }
      />

      <div className="mt-3 flex gap-9">
        <Checkbox
          name="isPark"
          id={"isPark"}
          checked={parkData.isPark}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setParkData((prev) => ({ ...prev, isPark: e.target.checked }));
          }}
        >
          É Praça:
        </Checkbox>

        <Checkbox
          name="inactiveNotFound"
          id={"inactiveNotFound"}
          checked={parkData.inactiveNotFound}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setParkData((prev) => ({
              ...prev,
              inactiveNotFound: e.target.checked,
            }));
          }}
        >
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
        {shapefile ?
          <div>
            <p>Arquivo selecionado: {shapefile.name}</p>
            <Button
              onPress={() => {
                setShapefile(undefined);
              }}
            >
              Remover arquivo
            </Button>
          </div>
        : <input
            type="file"
            name="file"
            id="file"
            accept=".shp"
            onChange={(e) => {
              if (e.target.files) {
                const file = e.target.files[0];
                if (file) {
                  setShapefile({ file: file, name: file.name });
                  return;
                }
              }
              setShapefile(undefined);
            }}
          />
        }
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
