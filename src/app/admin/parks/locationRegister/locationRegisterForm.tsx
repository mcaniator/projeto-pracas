"use client";

import { BrazilianStates } from "@prisma/client";
import {
  IconCircleDashedCheck,
  IconDeviceFloppy,
  IconHelp,
} from "@tabler/icons-react";
import Link from "next/link";
import React, { useActionState, useEffect, useState } from "react";

import LoadingIcon from "../../../../components/LoadingIcon";
import { Button } from "../../../../components/button";
import { Checkbox } from "../../../../components/ui/checkbox";
import { Input } from "../../../../components/ui/input";
import { Select } from "../../../../components/ui/select";
import {
  stateToFederativeUnitMap,
  ufToStateMap,
} from "../../../../lib/types/brazilianFederativeUnits";
import { FetchCitiesType } from "../../../../serverActions/cityUtil";
import { createLocation } from "../../../../serverActions/manageLocations";

type AdministrativeUnitLevels = "NARROW" | "INTERMEDIATE" | "BROAD";
const initialState = {
  statusCode: -1,
  message: "Initial",
};
const ParkRegisterForm = ({ cities }: { cities: FetchCitiesType }) => {
  const [formState, formAction, isPending] = useActionState(
    createLocation,
    initialState,
  );
  const [selectedState, setSelectedState] = useState<
    BrazilianStates | "SELECIONAR"
  >("SELECIONAR");
  const [stateCities, setStateCities] = useState<{
    loading: boolean;
    error: boolean;
    names: string[];
  }>({ loading: false, error: false, names: [] });
  const [selectedCity, setSelectedCity] = useState<string>(
    "NENHUMA CIDADE ENCONTRADA!",
  );
  const [administrativeUnitInput, setAdministrativeUnitInput] = useState<{
    narrow: boolean;
    intermediate: boolean;
    broad: boolean;
  }>({
    narrow: true,
    intermediate: true,
    broad: true,
  });
  const [showHelp, setShowHelp] = useState(false);
  const fetchStateCities = async (state: string) => {
    try {
      setStateCities(() => ({ loading: true, error: false, names: [] }));
      const fetchedCities = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`,
        { method: "GET" },
      );
      const citiesData: { nome: string }[] =
        (await fetchedCities.json()) as Array<{ nome: string }>;
      citiesData.sort((a, b) => a.nome.localeCompare(b.nome));
      setStateCities({
        loading: false,
        error: false,
        names: citiesData.map((city) => city.nome),
      });
      setSelectedCity(citiesData[0]?.nome || "NENHUMA CIDADE ENCONTRADA");
    } catch (e) {
      setStateCities({ loading: false, error: true, names: [] });
    }
  };
  const handleCitySelectChange = (
    e:
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSelectedCity(e.target.value);
    setAdministrativeUnitInput({
      narrow: true,
      intermediate: true,
      broad: true,
    });
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
    if (selectedState !== "SELECIONAR") void fetchStateCities(selectedState);
  }, [selectedState]);
  return (
    <div>
      {isPending && (
        <div className="flex justify-center">
          <LoadingIcon className="h-32 w-32 text-2xl" />
        </div>
      )}
      {!isPending &&
        formState.statusCode !== -1 &&
        formState.statusCode !== 201 && (
          <p className="text-xl text-red-500">Erro ao enviar!</p>
        )}
      {!isPending && formState.statusCode !== 201 && (
        <form action={formAction} className={"flex flex-col gap-2"}>
          <div className="w-full max-w-[70rem]">
            <label htmlFor={"name"}>Nome:</label>
            <Input
              type="text"
              name="name"
              required
              id={"name"}
              className="w-full"
            />

            <label htmlFor={"notes"}>Notas:</label>
            <Input type="text" name="notes" id={"notes"} className="w-full" />

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
                  <option
                    key={key}
                    value={stateToFederativeUnitMap.get(value) || "SELECIONAR"}
                  >
                    {value}
                  </option>
                ),
              )}
            </Select>
            {selectedState !== "SELECIONAR" && (
              <div>
                <label htmlFor="cityName">Cidade</label>
                {stateCities.loading ?
                  <div className="flex justify-center">
                    <LoadingIcon className="h-32 w-32" />
                  </div>
                : stateCities.error ?
                  <Input
                    name="cityNameSelect"
                    id="cityNameSelect"
                    className="w-full"
                    onChange={handleCitySelectChange}
                  />
                : <Select
                    onChange={handleCitySelectChange}
                    value={selectedCity}
                    name="cityNameSelect"
                    id="cityNameSelect"
                  >
                    {stateCities.names.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </Select>
                }

                <label htmlFor="narrowAdministrativeUnit">
                  Região administrativa estreita
                </label>
                <Select
                  id="narrowAdministrativeUnitSelect"
                  name="narrowAdministrativeUnitSelect"
                  onChange={(e) => {
                    handleAdministrativeUnitChange(e, "NARROW");
                  }}
                >
                  {cities
                    ?.find(
                      (city) =>
                        city.name === selectedCity &&
                        city.state === ufToStateMap.get(selectedState),
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
                      className="w-full"
                      id="narrowAdministrativeUnit"
                      name="narrowAdministrativeUnit"
                    ></Input>
                  </>
                )}

                <label htmlFor="intermediateAdministrativeUnit">
                  Região administrativa intermediária
                </label>
                <Select
                  id="intermediateAdministrativeUnitSelect"
                  name="intermediateAdministrativeUnitSelect"
                  onChange={(e) => {
                    handleAdministrativeUnitChange(e, "INTERMEDIATE");
                  }}
                >
                  {cities
                    ?.find(
                      (city) =>
                        city.name === selectedCity &&
                        city.state === ufToStateMap.get(selectedState),
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
                      id="intermediateAdministrativeUnit"
                      name="intermediateAdministrativeUnit"
                      className="w-full"
                    ></Input>
                  </>
                )}

                <label htmlFor="broadAdministrativeUnit">
                  Região administrativa ampla
                </label>
                <Select
                  id="broadAdministrativeUnitSelect"
                  name="broadAdministrativeUnitSelect"
                  onChange={(e) => {
                    handleAdministrativeUnitChange(e, "BROAD");
                  }}
                >
                  {cities
                    ?.find(
                      (city) =>
                        city.name === selectedCity &&
                        city.state === ufToStateMap.get(selectedState),
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
                      className="w-full"
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
              className="w-full"
              required
            />

            <label htmlFor="secondStreet">Segunda rua:</label>
            <Input
              className="w-full"
              type="text"
              name="secondStreet"
              id="secondStreet"
              required
            />

            <label htmlFor={"creationYear"}>Data de Criação:</label>
            <Input
              className="w-full"
              type="date"
              name="creationYear"
              id={"creationYear"}
            />

            <label htmlFor={"lastMaintenanceYear"}>
              Data da Última Manutenção:
            </label>
            <Input
              className="w-full"
              type="date"
              name="lastMaintenanceYear"
              id={"lastMaintenanceYear"}
            />

            <label htmlFor={"overseeingMayor"}>Prefeito Inaugurador:</label>
            <Input
              className="w-full"
              type="text"
              name="overseeingMayor"
              id={"overseeingMayor"}
            />

            <label htmlFor={"legislation"}>Legislação:</label>
            <Input
              className="w-full"
              type="text"
              name="legislation"
              id={"legislation"}
            />

            <label htmlFor={"usableArea"}>Área Útil:</label>
            <Input
              className="w-full"
              type="number"
              name="usableArea"
              id={"usableArea"}
            />

            <label htmlFor={"legalArea"}>Área Prefeitura:</label>
            <Input
              className="w-full"
              type="number"
              name="legalArea"
              id={"legalArea"}
            />

            <label htmlFor={"incline"}>Inclinação:</label>
            <Input
              className="w-full"
              type="number"
              name="incline"
              id={"incline"}
            />

            <div className="ml-auto flex gap-9">
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
          </div>

          <div className="mb-2 flex w-full max-w-[70rem] items-center justify-between rounded p-2">
            <Button variant={"constructive"} type="submit">
              <IconDeviceFloppy />
            </Button>
          </div>
        </form>
      )}
      {!isPending && formState.statusCode === 201 && (
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-2xl text-green-500">Localização registrada!</p>
          <div className="flex justify-center text-green-500">
            <IconCircleDashedCheck size={64} />
          </div>
          <Link
            href={"/admin/parks"}
            className="flex w-fit items-center justify-center rounded-lg bg-true-blue p-2 text-xl bg-blend-darken shadow-md transition-all duration-200 hover:bg-indigo-dye"
          >
            Voltar às praças
          </Link>
        </div>
      )}
    </div>
  );
};

export default ParkRegisterForm;
