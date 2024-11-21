"use client";

import { Button } from "@/components/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { handleDelete, updateLocation } from "@/serverActions/locationUtil";
import { BrazilianStates, Location } from "@prisma/client";
import Link from "next/link";
import { useActionState, useRef } from "react";

import LoadingIcon from "../../../../../components/LoadingIcon";

interface LocationWithCity extends Location {
  city: {
    name: string;
    state: BrazilianStates;
  } | null;
}

const initialState = {
  statusCode: 0,
};
const LocationUpdater = ({ location }: { location: LocationWithCity }) => {
  const [, formAction, isPending] = useActionState(
    updateLocation,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  // TODO: add error handling
  return (
    <div
      className={"flex max-h-full min-h-0 flex-grow gap-5 overflow-auto p-5"}
    >
      <div className="flex basis-3/5 flex-col gap-5 text-white">
        <div
          className={
            "flex basis-1/5 flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 shadow-md"
          }
        >
          {isPending && (
            <div className="flex justify-center">
              <LoadingIcon className="h-32 w-32 text-2xl" />
            </div>
          )}
          {!isPending && (
            <form
              ref={formRef}
              action={formAction}
              className={"flex flex-col gap-2"}
              onSubmit={() =>
                setTimeout(() => {
                  formRef.current?.reset();
                }, 1)
              }
            >
              <div>
                <label htmlFor={"name"}>Nome:</label>
                <Input
                  type="text"
                  name="name"
                  required
                  id={"name"}
                  defaultValue={location.name === null ? "" : location.name}
                />

                <label htmlFor={"notes"}>Notas:</label>
                <Input
                  type="text"
                  name="notes"
                  id={"notes"}
                  defaultValue={location.notes === null ? "" : location.notes}
                />

                <label htmlFor="cityName">Cidade</label>
                <Input
                  type="text"
                  name="cityName"
                  id="cityName"
                  defaultValue={location.city?.name}
                />

                <label htmlFor="stateName">Estado:</label>
                <Select
                  id="stateName"
                  name="stateName"
                  defaultValue={
                    location.city ? (location.city.state as string) : "NONE"
                  }
                >
                  <option value="NONE">NENHUM</option>
                  {Object.entries(
                    BrazilianStates as Record<string, string>,
                  ).map(([key, value]) => (
                    <option key={key} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>

                <label htmlFor="firstStreet">Primeira rua:</label>
                <Input
                  type="text"
                  name="firstStreet"
                  id="firstStreet"
                  defaultValue={location.firstStreet}
                />

                <label htmlFor="secondStreet">Segunda rua:</label>
                <Input
                  type="text"
                  name="secondStreet"
                  id="secondStreet"
                  defaultValue={location.secondStreet}
                />

                <label htmlFor={"creationYear"}>Data de Criação:</label>
                <Input
                  type="date"
                  name="creationYear"
                  id={"creationYear"}
                  defaultValue={
                    location.creationYear === null ?
                      ""
                    : new Date(location.creationYear)
                        .toISOString()
                        .split("T")[0]
                  }
                />

                <label htmlFor={"lastMaintenanceYear"}>
                  Data da Última Manutenção:
                </label>
                <Input
                  type="date"
                  name="lastMaintenanceYear"
                  id={"lastMaintenanceYear"}
                  defaultValue={
                    location.lastMaintenanceYear === null ?
                      ""
                    : new Date(location.lastMaintenanceYear)
                        .toISOString()
                        .split("T")[0]
                  }
                />

                <label htmlFor={"overseeingMayor"}>Prefeito Inaugurador:</label>
                <Input
                  type="text"
                  name="overseeingMayor"
                  id={"overseeingMayor"}
                  defaultValue={
                    location.overseeingMayor === null ?
                      ""
                    : location.overseeingMayor
                  }
                />

                <label htmlFor={"legislation"}>Legislação:</label>
                <Input
                  type="text"
                  name="legislation"
                  id={"legislation"}
                  defaultValue={
                    location.legislation === null ? "" : location.legislation
                  }
                />

                <label htmlFor={"usableArea"}>Área Útil:</label>
                <Input
                  type="number"
                  name="usableArea"
                  id={"usableArea"}
                  defaultValue={
                    location.usableArea === null ? "" : location.usableArea
                  }
                />

                <label htmlFor={"legalArea"}>Área Prefeitura:</label>
                <Input
                  type="number"
                  name="legalArea"
                  id={"legalArea"}
                  defaultValue={
                    location.legalArea === null ? "" : location.legalArea
                  }
                />

                <label htmlFor={"incline"}>Inclinação:</label>
                <Input
                  type="number"
                  name="incline"
                  id={"incline"}
                  defaultValue={
                    location.incline === null ? "" : location.incline
                  }
                />

                <Input
                  type="hidden"
                  name="locationId"
                  id={"locationId"}
                  className={"hidden"}
                  defaultValue={location.id}
                />

                <div className="ml-auto flex gap-9">
                  <Checkbox
                    name="isPark"
                    id={"isPark"}
                    defaultChecked={location.isPark === true}
                  >
                    É Praça:
                  </Checkbox>

                  <Checkbox
                    name="inactiveNotFound"
                    id={"inactiveNotFound"}
                    defaultChecked={location.inactiveNotFound === true}
                  >
                    Inativo ou não encontrado
                  </Checkbox>
                </div>
                <div className="flex flex-col">
                  <label htmlFor="file">Importar arquivo shapefile:</label>
                  <input type="file" name="file" id="file" accept=".shp" />
                </div>
              </div>

              <div className="mb-2 flex items-center justify-between rounded p-2">
                <Button variant={"admin"} type="submit" className={"w-min"}>
                  <span className={"-mb-1"}>Enviar</span>
                </Button>

                <Link href={"/admin/parks"}>
                  <Button
                    type="button"
                    variant={"destructive"}
                    onPress={() => void handleDelete(location.id)}
                    className={"w-min"}
                  >
                    <span className={"-mb-1"}>Deletar</span>
                  </Button>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export { LocationUpdater };
