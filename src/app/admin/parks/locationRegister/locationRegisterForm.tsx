"use client";

import { BrazilianStates } from "@prisma/client";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { useActionState, useEffect, useState } from "react";

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
  errorCode: -1,
  errorMessage: "Initial",
};
const ParkRegisterForm = ({ cities }: { cities: FetchCitiesType }) => {
  const [, formAction, isPending] = useActionState(
    createLocation,
    initialState,
  );
  const [selectedState, setSelectedState] = useState<
    BrazilianStates | "SELECIONAR"
  >("SELECIONAR");
  const [stateCities, setStateCities] = useState<string[]>([]);
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
  const fetchStateCities = async (state: BrazilianStates) => {
    try {
      const fetchedCities = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`,
        { method: "GET" },
      );
      const citiesData: { nome: string }[] =
        (await fetchedCities.json()) as Array<{ nome: string }>;
      citiesData.sort((a, b) => a.nome.localeCompare(b.nome));
      setStateCities(citiesData.map((city) => city.nome));
      setSelectedCity(citiesData[0]?.nome || "NENHUMA CIDADE ENCONTRADA");
    } catch (e) {
      console.log(e);
    }
  };
  //console.log(stateCities);
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
    if (selectedState !== "SELECIONAR") void fetchStateCities(selectedState);
  }, [selectedState]);
  return (
    <div>
      {isPending && (
        <div className="flex justify-center">
          <LoadingIcon className="h-32 w-32 text-2xl" />
        </div>
      )}
      {!isPending && (
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
                <Select
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
            />

            <label htmlFor="secondStreet">Segunda rua:</label>
            <Input
              className="w-full"
              type="text"
              name="secondStreet"
              id="secondStreet"
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
              <label htmlFor="file">Importar arquivo shapefile:</label>
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
    </div>
  );
};

export default ParkRegisterForm;
