"use client";

import { Button } from "@/components/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { handleDelete, updateLocation } from "@/serverActions/locationUtil";
import { LocationWithCity } from "@/serverActions/locationUtil";
import { BrazilianStates } from "@prisma/client";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import LoadingIcon from "../../../../../components/LoadingIcon";
import { FetchCitiesType } from "../../../../../serverActions/cityUtil";

type AdministrativeUnitLevels = "NARROW" | "INTERMEDIATE" | "BROAD";

const initialState = {
  statusCode: 0,
};
const LocationUpdater = ({
  location,
  cities,
}: {
  location: LocationWithCity;
  cities: FetchCitiesType;
}) => {
  const [, formAction, isPending] = useActionState(
    updateLocation,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedState, setSelectedState] = useState<
    BrazilianStates | "SELECIONAR"
  >(
    location.narrowAdministrativeUnit?.city?.state ||
      location.intermediateAdministrativeUnit?.city?.state ||
      location.broadAdministrativeUnit?.city?.state ||
      "SELECIONAR",
  );
  const [stateCities, setStateCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>(
    location.narrowAdministrativeUnit?.city?.name ||
      location.intermediateAdministrativeUnit?.city?.name ||
      location.broadAdministrativeUnit?.city?.name ||
      stateCities[0] ||
      "NENHUMA CIDADE ENCONTRADA!",
  );
  const [administrativeUnitInput, setAdministrativeUnitInput] = useState<{
    narrow: boolean;
    intermediate: boolean;
    broad: boolean;
  }>({
    narrow: location.narrowAdministrativeUnitId === null,
    intermediate: location.intermediateAdministrativeUnitId === null,
    broad: location.broadAdministrativeUnitId === null,
  });
  const handleCitySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(e.target.value);
  };
  const handleAdministrativeUnitChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    administrativeUnit: AdministrativeUnitLevels,
  ) => {
    administrativeUnit === "NARROW" &&
      setAdministrativeUnitInput((prev) => ({
        ...prev,
        narrow: e.target.value === "CREATE",
      }));
    administrativeUnit === "INTERMEDIATE" &&
      setAdministrativeUnitInput((prev) => ({
        ...prev,
        intermediate: e.target.value === "CREATE",
      }));
    administrativeUnit === "BROAD" &&
      setAdministrativeUnitInput((prev) => ({
        ...prev,
        broad: e.target.value === "CREATE",
      }));
  };
  useEffect(() => {
    setStateCities(
      cities
        ?.filter((city) => city.state === selectedState)
        .map((city) => city.name) || [],
    );
  }, [selectedState, cities]);
  useEffect(() => {
    setSelectedCity(
      location.narrowAdministrativeUnit?.city?.name ||
        location.intermediateAdministrativeUnit?.city?.name ||
        location.broadAdministrativeUnit?.city?.name ||
        stateCities[0] ||
        "NENHUMA CIDADE ENCONTRADA!",
    );
  }, [
    stateCities,
    location.broadAdministrativeUnit?.city?.name,
    location.intermediateAdministrativeUnit?.city?.name,
    location.narrowAdministrativeUnit?.city?.name,
  ]);
  // TODO: add error handling
  return (
    <div>
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
              className="w-full max-w-[70rem]"
              defaultValue={location.name === null ? "" : location.name}
            />

            <label htmlFor={"notes"}>Notas:</label>
            <Input
              type="text"
              name="notes"
              id={"notes"}
              className="w-full max-w-[70rem]"
              defaultValue={location.notes === null ? "" : location.notes}
            />

            <label htmlFor="stateName">Estado:</label>
            <Select
              id="stateName"
              name="stateName"
              defaultValue={selectedState}
              onChange={(e) => {
                setSelectedState(
                  (e.target.value as BrazilianStates) || "SELECIONAR",
                );
              }}
            >
              <option value={"SELECIONAR"}>SELECIONAR</option>
              {Object.entries(BrazilianStates as Record<string, string>).map(
                ([key, value]) => (
                  <option key={key} value={value}>
                    {value}
                  </option>
                ),
              )}
            </Select>
            {selectedState !== "SELECIONAR" && (
              <div>
                <label htmlFor="cityName">Cidade</label>
                <Select
                  className="w-full max-w-[70rem]"
                  onChange={handleCitySelectChange}
                  value={selectedCity}
                  name="cityNameSelect"
                  id="cityNameSelect"
                >
                  {stateCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </Select>

                <label htmlFor="narrowAdministrativeUnit">
                  Região administrativa estreita
                </label>
                <Select
                  className="w-full max-w-[70rem]"
                  id="narrowAdministrativeUnitSelect"
                  name="narrowAdministrativeUnitSelect"
                  defaultValue={
                    location.narrowAdministrativeUnit?.name || "CREATE"
                  }
                  onChange={(e) => {
                    handleAdministrativeUnitChange(e, "NARROW");
                  }}
                >
                  {cities
                    ?.find(
                      (city) =>
                        city.name === selectedCity &&
                        city.state === selectedState,
                    )
                    ?.narrowAdministrativeUnit.map((ad) => {
                      return (
                        <option key={ad.id} value={ad.name}>
                          {ad.name}
                        </option>
                      );
                    })}
                  <option value="CREATE">REGISTRAR</option>
                </Select>
                {administrativeUnitInput.narrow && (
                  <>
                    <label htmlFor="narrowAdministrativeUnit">
                      Registrar unidade administrativa estreita
                    </label>
                    <Input
                      className="w-full max-w-[70rem]"
                      id="narrowAdministrativeUnit"
                      name="narrowAdministrativeUnit"
                    ></Input>
                  </>
                )}

                <label htmlFor="intermediateAdministrativeUnit">
                  Região administrativa intermediária
                </label>
                <Select
                  className="w-full max-w-[70rem]"
                  id="intermediateAdministrativeUnitSelect"
                  name="intermediateAdministrativeUnitSelect"
                  defaultValue={
                    location.intermediateAdministrativeUnit?.name || "CREATE"
                  }
                  onChange={(e) => {
                    handleAdministrativeUnitChange(e, "INTERMEDIATE");
                  }}
                >
                  {cities
                    ?.find(
                      (city) =>
                        city.name === selectedCity &&
                        city.state === selectedState,
                    )
                    ?.intermediateAdministrativeUnit.map((ad) => {
                      return (
                        <option key={ad.id} value={ad.name}>
                          {ad.name}
                        </option>
                      );
                    })}
                  <option value="CREATE">REGISTRAR</option>
                </Select>
                {administrativeUnitInput.intermediate && (
                  <>
                    <label htmlFor="intermediateAdministrativeUnit">
                      Registrar unidade administrativa intermediária
                    </label>
                    <Input
                      className="w-full max-w-[70rem]"
                      id="intermediateAdministrativeUnit"
                      name="intermediateAdministrativeUnit"
                    ></Input>
                  </>
                )}

                <label htmlFor="broadAdministrativeUnit">
                  Região administrativa ampla
                </label>
                <Select
                  className="w-full max-w-[70rem]"
                  id="broadAdministrativeUnitSelect"
                  name="broadAdministrativeUnitSelect"
                  defaultValue={
                    location.broadAdministrativeUnit?.name || "CREATE"
                  }
                  onChange={(e) => {
                    handleAdministrativeUnitChange(e, "BROAD");
                  }}
                >
                  {cities
                    ?.find(
                      (city) =>
                        city.name === selectedCity &&
                        city.state === selectedState,
                    )
                    ?.broadAdministrativeUnit.map((ad) => {
                      return (
                        <option key={ad.id} value={ad.name}>
                          {ad.name}
                        </option>
                      );
                    })}
                  <option value="CREATE">REGISTRAR</option>
                </Select>
                {administrativeUnitInput.broad && (
                  <>
                    <label htmlFor="broadAdministrativeUnit">
                      Registrar região administrativa ampla
                    </label>
                    <Input
                      className="w-full max-w-[70rem]"
                      id="broadAdministrativeUnit"
                      name="broadAdministrativeUnit"
                    ></Input>
                  </>
                )}
              </div>
            )}

            <label htmlFor="firstStreet">Primeira rua:</label>
            <Input
              type="text"
              name="firstStreet"
              id="firstStreet"
              defaultValue={location.firstStreet}
              className="w-full max-w-[70rem]"
            />

            <label htmlFor="secondStreet">Segunda rua:</label>
            <Input
              className="w-full max-w-[70rem]"
              type="text"
              name="secondStreet"
              id="secondStreet"
              defaultValue={location.secondStreet}
            />

            <label htmlFor={"creationYear"}>Data de Criação:</label>
            <Input
              className="w-full max-w-[70rem]"
              type="date"
              name="creationYear"
              id={"creationYear"}
              defaultValue={
                location.creationYear === null ?
                  ""
                : new Date(location.creationYear).toISOString().split("T")[0]
              }
            />

            <label htmlFor={"lastMaintenanceYear"}>
              Data da Última Manutenção:
            </label>
            <Input
              className="w-full max-w-[70rem]"
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
              className="w-full max-w-[70rem]"
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
              className="w-full max-w-[70rem]"
              type="text"
              name="legislation"
              id={"legislation"}
              defaultValue={
                location.legislation === null ? "" : location.legislation
              }
            />

            <label htmlFor={"usableArea"}>Área Útil:</label>
            <Input
              className="w-full max-w-[70rem]"
              type="number"
              name="usableArea"
              id={"usableArea"}
              defaultValue={
                location.usableArea === null ? "" : location.usableArea
              }
            />

            <label htmlFor={"legalArea"}>Área Prefeitura:</label>
            <Input
              className="w-full max-w-[70rem]"
              type="number"
              name="legalArea"
              id={"legalArea"}
              defaultValue={
                location.legalArea === null ? "" : location.legalArea
              }
            />

            <label htmlFor={"incline"}>Inclinação:</label>
            <Input
              className="w-full max-w-[70rem]"
              type="number"
              name="incline"
              id={"incline"}
              defaultValue={location.incline === null ? "" : location.incline}
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
  );
};

export { LocationUpdater };
