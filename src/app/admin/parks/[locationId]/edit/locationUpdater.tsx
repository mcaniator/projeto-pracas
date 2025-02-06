"use client";

import { Button } from "@/components/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { handleDelete, updateLocation } from "@/serverActions/locationUtil";
import { LocationWithCity } from "@/serverActions/locationUtil";
import { BrazilianStates } from "@prisma/client";
import {
  IconCircleDashedCheck,
  IconDeviceFloppy,
  IconHelp,
  IconTrash,
} from "@tabler/icons-react";
import Link from "next/link";
import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import LoadingIcon from "../../../../../components/LoadingIcon";
import {
  stateToFederativeUnitMap,
  ufToStateMap,
} from "../../../../../lib/types/brazilianFederativeUnits";
import { FetchCitiesType } from "../../../../../serverActions/cityUtil";

type AdministrativeUnitLevels = "NARROW" | "INTERMEDIATE" | "BROAD";

const initialState = {
  statusCode: 0,
  message: "initial",
};
const LocationUpdater = ({
  location,
  cities,
}: {
  location: LocationWithCity;
  cities: FetchCitiesType;
}) => {
  const [formState, formAction, isPending] = useActionState(
    updateLocation,
    initialState,
  );
  const [showHelp, setShowHelp] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const locationCity = useRef(
    location.narrowAdministrativeUnit?.city?.name ||
      location.intermediateAdministrativeUnit?.city?.name ||
      location.broadAdministrativeUnit?.city?.name,
  );
  const locationState = useRef(
    stateToFederativeUnitMap.get(
      location.narrowAdministrativeUnit?.city?.state || "",
    ) ||
      stateToFederativeUnitMap.get(
        location.intermediateAdministrativeUnit?.city?.state || "",
      ) ||
      stateToFederativeUnitMap.get(
        location.broadAdministrativeUnit?.city?.state || "",
      ),
  );
  const [selectedState, setSelectedState] = useState<string>(() => {
    const locationState =
      location.narrowAdministrativeUnit?.city?.state ||
      location.intermediateAdministrativeUnit?.city?.state ||
      location.broadAdministrativeUnit?.city?.state;
    if (locationState) {
      const locationUF = stateToFederativeUnitMap.get(locationState);
      return locationUF ?? "SELECIONAR";
    } else {
      return "SELECIONAR";
    }
  });
  const [stateCities, setStateCities] = useState<{
    loading: boolean;
    error: boolean;
    names: string[];
  }>({ loading: false, error: false, names: [] });
  const [selectedCity, setSelectedCity] = useState<string>(
    location.narrowAdministrativeUnit?.city?.name ||
      location.intermediateAdministrativeUnit?.city?.name ||
      location.broadAdministrativeUnit?.city?.name ||
      stateCities.names[0] ||
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
  const fetchStateCities = useCallback(
    async (state: string) => {
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

        if (
          locationCity.current &&
          locationState.current &&
          locationState.current === selectedState &&
          citiesData.some((cityData) => cityData.nome === locationCity.current)
        ) {
          setSelectedCity(locationCity.current);
        } else {
          setSelectedCity(citiesData[0]?.nome || "NENHUMA CIDADE ENCONTRADA");
        }
      } catch (e) {
        setStateCities({ loading: false, error: true, names: [] });
      }
    },
    [selectedState, locationCity, locationState],
  );
  const handleCitySelectChange = (
    e:
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLInputElement>,
  ) => {
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
  }, [selectedState, cities, fetchStateCities]);

  // TODO: add error handling
  return (
    <div>
      {isPending && (
        <div className="flex justify-center">
          <LoadingIcon className="h-32 w-32 text-2xl" />
        </div>
      )}
      {!isPending &&
        formState.statusCode !== 0 &&
        formState.statusCode !== 200 && (
          <p className="text-xl text-red-500">Erro ao enviar!</p>
        )}
      {!isPending && formState.statusCode !== 200 && (
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
          <div className="w-full max-w-[70rem]">
            <label htmlFor={"name"}>Nome:</label>
            <Input
              type="text"
              name="name"
              required
              id={"name"}
              className="w-full"
              defaultValue={location.name === null ? "" : location.name}
            />

            <label htmlFor={"notes"}>Notas:</label>
            <Input
              type="text"
              name="notes"
              id={"notes"}
              className="w-full"
              defaultValue={location.notes === null ? "" : location.notes}
            />

            <label htmlFor="stateName">Estado:</label>
            <Select
              id="stateName"
              name="stateName"
              value={selectedState}
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
              defaultValue={location.firstStreet}
              className="w-full"
            />

            <label htmlFor="secondStreet">Segunda rua:</label>
            <Input
              className="w-full"
              type="text"
              name="secondStreet"
              id="secondStreet"
              defaultValue={location.secondStreet}
            />

            <label htmlFor={"creationYear"}>Data de Criação:</label>
            <Input
              className="w-full"
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
              className="w-full"
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
              className="w-full"
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
              className="w-full"
              type="text"
              name="legislation"
              id={"legislation"}
              defaultValue={
                location.legislation === null ? "" : location.legislation
              }
            />

            <label htmlFor={"usableArea"}>Área Útil:</label>
            <Input
              className="w-full"
              type="number"
              name="usableArea"
              id={"usableArea"}
              defaultValue={
                location.usableArea === null ? "" : location.usableArea
              }
            />

            <label htmlFor={"legalArea"}>Área Prefeitura:</label>
            <Input
              className="w-full"
              type="number"
              name="legalArea"
              id={"legalArea"}
              defaultValue={
                location.legalArea === null ? "" : location.legalArea
              }
            />

            <label htmlFor={"incline"}>Inclinação:</label>
            <Input
              className="w-full"
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
            <Button
              type="button"
              variant={"destructive"}
              onPress={() => void handleDelete(location.id)}
              className={"w-min"}
            >
              <IconTrash />
            </Button>

            <Button variant={"constructive"} type="submit">
              <IconDeviceFloppy />
            </Button>
          </div>
        </form>
      )}
      {!isPending && formState.statusCode === 200 && (
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-2xl text-green-500">Localização atualizada!</p>
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

export { LocationUpdater };
