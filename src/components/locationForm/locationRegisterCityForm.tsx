"use client";

import { BrazilianStates } from "@prisma/client";
import { IconArrowBackUp, IconArrowForwardUp } from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { FetchCitiesType } from "../../serverActions/cityUtil";
import LoadingIcon from "../LoadingIcon";
import { Button } from "../button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { ParkData } from "./locationRegisterFormClient";

type AdministrativeUnitLevels = "NARROW" | "INTERMEDIATE" | "BROAD";
const LocationRegisterCityForm = ({
  cities,
  parkData,
  registerAdministrativeUnit,
  goToPreviousPage,
  goToNextPage,
  setParkData,
  setRegisterAdministrativeUnit,
}: {
  cities: FetchCitiesType;
  parkData: ParkData;
  registerAdministrativeUnit: {
    narrow: boolean;
    intermediate: boolean;
    broad: boolean;
  };
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  setParkData: React.Dispatch<React.SetStateAction<ParkData>>;
  setRegisterAdministrativeUnit: React.Dispatch<
    React.SetStateAction<{
      narrow: boolean;
      intermediate: boolean;
      broad: boolean;
    }>
  >;
}) => {
  const initialState = useRef(parkData.state);
  const [selectedState, setSelectedState] = useState<string>(
    parkData.state ?? "%NONE",
  );
  const [stateCities, setStateCities] = useState<{
    loading: boolean;
    error: boolean;
    names: string[];
  }>({ loading: false, error: false, names: [] });
  const [showError, setShowError] = useState(false);
  const handleCitySelectChange = useCallback(
    (
      e:
        | React.ChangeEvent<HTMLSelectElement>
        | React.ChangeEvent<HTMLInputElement>
        | string,
    ) => {
      if (typeof e === "string") {
        setParkData((prev) => ({
          ...prev,
          city: e.trim() === "" ? null : e,
          narrowAdministrativeUnit: null,
          intermediateAdministrativeUnit: null,
          broadAdministrativeUnit: null,
        }));
        setRegisterAdministrativeUnit({
          narrow: false,
          intermediate: false,
          broad: false,
        });
        return;
      }
      setParkData((prev) => ({
        ...prev,
        city: e.target.value.trim() === "" ? null : e.target.value,
        narrowAdministrativeUnit: null,
        intermediateAdministrativeUnit: null,
        broadAdministrativeUnit: null,
      }));
      setRegisterAdministrativeUnit({
        narrow: false,
        intermediate: false,
        broad: false,
      });
    },
    [setParkData, setRegisterAdministrativeUnit],
  );

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
        if (parkData.state === initialState.current) return;
        handleCitySelectChange(citiesData[0]?.nome ?? "");
      } catch (e) {
        setStateCities({ loading: false, error: true, names: [] });
      }
    },
    [parkData.state, handleCitySelectChange],
  );

  const handleAdministrativeUnitRegisterChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    administrativeUnit: AdministrativeUnitLevels,
  ) => {
    administrativeUnit === "NARROW" &&
      setRegisterAdministrativeUnit((prev) => ({
        ...prev,
        narrow: e.target.value === "%CREATE",
      }));
    administrativeUnit === "INTERMEDIATE" &&
      setRegisterAdministrativeUnit((prev) => ({
        ...prev,
        intermediate: e.target.value === "%CREATE",
      }));
    administrativeUnit === "BROAD" &&
      setRegisterAdministrativeUnit((prev) => ({
        ...prev,
        broad: e.target.value === "%CREATE",
      }));
  };

  const handleGoToNextPage = () => {
    if (parkData.state) {
      if (
        !parkData.narrowAdministrativeUnit &&
        !parkData.intermediateAdministrativeUnit &&
        !parkData.broadAdministrativeUnit
      ) {
        setShowError(true);
      } else {
        goToNextPage();
      }
    } else {
      goToNextPage();
    }
  };
  useEffect(() => {
    if (selectedState !== "%NONE") void fetchStateCities(selectedState);
  }, [selectedState, fetchStateCities]);
  return (
    <div className="flex w-full max-w-[70rem] flex-col">
      <h3 className="text-lg">Cidade</h3>
      <label htmlFor="stateName">Estado*:</label>
      <Select
        id="stateName"
        name="stateName"
        defaultValue={selectedState}
        onChange={(e) => {
          setSelectedState((e.target.value as BrazilianStates) || "%NONE");
          setParkData((prev) => ({
            ...prev,
            state: e.target.value,
          }));
        }}
      >
        <option value={"%NONE"}>NÃO SELECIONADO</option>
        {Object.entries(BrazilianStates as Record<string, string>).map(
          ([key, value]) => (
            <option key={key} value={value || "%NONE"}>
              {value}
            </option>
          ),
        )}
      </Select>
      {selectedState !== "%NONE" && (
        <div className="flex flex-col">
          <label
            htmlFor="cityName"
            className={`mt-3 ${stateCities.error && "text-red-500"}`}
          >
            {stateCities.error ?
              "Houve um erro ao buscar as cidades. Por favor, escreva o nome da cidade*:"
            : "Cidade*:"}
          </label>
          {stateCities.loading ?
            <div className="flex justify-center">
              <LoadingIcon className="h-32 w-32" />
            </div>
          : stateCities.error ?
            <Input
              name="cityNameSelect"
              id="cityNameSelect"
              className="w-full"
              value={parkData.city ?? ""}
              onChange={handleCitySelectChange}
            />
          : <Select
              onChange={handleCitySelectChange}
              value={parkData.city ?? cities?.[0]?.name ?? ""}
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

          <label htmlFor="narrowAdministrativeUnit" className="mt-3">
            Região administrativa estreita:
          </label>
          <Select
            id="narrowAdministrativeUnitSelect"
            name="narrowAdministrativeUnitSelect"
            value={
              registerAdministrativeUnit.narrow ? "%CREATE" : (
                (parkData.narrowAdministrativeUnit ?? "")
              )
            }
            onChange={(e) => {
              handleAdministrativeUnitRegisterChange(e, "NARROW");
              setParkData((prev) => ({
                ...prev,
                narrowAdministrativeUnit:
                  e.target.value !== "%CREATE" && e.target.value !== "%NULL" ?
                    e.target.value
                  : null,
              }));
            }}
          >
            <option value="%NULL"></option>
            <option value="%CREATE">REGISTRAR</option>
            {cities
              ?.find(
                (city) =>
                  city.name === parkData.city && city.state === selectedState,
              )
              ?.narrowAdministrativeUnit.map((ad) => {
                return (
                  <option key={ad.id} value={ad.name}>
                    {ad.name}
                  </option>
                );
              })}
          </Select>
          {registerAdministrativeUnit.narrow && (
            <>
              <label htmlFor="narrowAdministrativeUnit">
                Registrar unidade administrativa estreita:
              </label>
              <Input
                className="w-full"
                id="narrowAdministrativeUnit"
                name="narrowAdministrativeUnit"
                value={parkData.narrowAdministrativeUnit ?? ""}
                onChange={(e) => {
                  setParkData((prev) => ({
                    ...prev,
                    narrowAdministrativeUnit:
                      e.target.value !== "%CREATE" ? e.target.value : null,
                  }));
                }}
              ></Input>
            </>
          )}

          <label htmlFor="intermediateAdministrativeUnit" className="mt-3">
            Região administrativa intermediária:
          </label>
          <Select
            id="intermediateAdministrativeUnitSelect"
            name="intermediateAdministrativeUnitSelect"
            value={
              registerAdministrativeUnit.intermediate ? "%CREATE" : (
                (parkData.intermediateAdministrativeUnit ?? "")
              )
            }
            onChange={(e) => {
              handleAdministrativeUnitRegisterChange(e, "INTERMEDIATE");
              setParkData((prev) => ({
                ...prev,
                intermediateAdministrativeUnit:
                  e.target.value !== "%CREATE" && e.target.value !== "%NULL" ?
                    e.target.value
                  : null,
              }));
            }}
          >
            <option value="%NULL"></option>
            <option value="%CREATE">REGISTRAR</option>
            {cities
              ?.find(
                (city) =>
                  city.name === parkData.city && city.state === selectedState,
              )
              ?.intermediateAdministrativeUnit.map((ad) => {
                return (
                  <option key={ad.id} value={ad.name}>
                    {ad.name}
                  </option>
                );
              })}
          </Select>
          {registerAdministrativeUnit.intermediate && (
            <>
              <label htmlFor="intermediateAdministrativeUnit">
                Registrar unidade administrativa intermediária:
              </label>
              <Input
                id="intermediateAdministrativeUnit"
                name="intermediateAdministrativeUnit"
                className="w-full"
                value={parkData.intermediateAdministrativeUnit ?? ""}
                onChange={(e) => {
                  setParkData((prev) => ({
                    ...prev,
                    intermediateAdministrativeUnit:
                      e.target.value !== "%CREATE" ? e.target.value : null,
                  }));
                }}
              ></Input>
            </>
          )}

          <label htmlFor="broadAdministrativeUnit" className="mt-3">
            Região administrativa ampla:
          </label>
          <Select
            id="broadAdministrativeUnitSelect"
            name="broadAdministrativeUnitSelect"
            value={
              registerAdministrativeUnit.broad ? "%CREATE" : (
                (parkData.broadAdministrativeUnit ?? "")
              )
            }
            onChange={(e) => {
              handleAdministrativeUnitRegisterChange(e, "BROAD");
              setParkData((prev) => ({
                ...prev,
                broadAdministrativeUnit:
                  e.target.value !== "%CREATE" && e.target.value !== "%NULL" ?
                    e.target.value
                  : null,
              }));
            }}
          >
            <option value="%NULL"></option>
            <option value="%CREATE">REGISTRAR</option>
            {cities
              ?.find(
                (city) =>
                  city.name === parkData.city && city.state === selectedState,
              )
              ?.broadAdministrativeUnit.map((ad) => {
                return (
                  <option key={ad.id} value={ad.name}>
                    {ad.name}
                  </option>
                );
              })}
          </Select>
          {registerAdministrativeUnit.broad && (
            <>
              <label htmlFor="broadAdministrativeUnit">
                Registrar região administrativa ampla:
              </label>
              <Input
                className="w-full"
                id="broadAdministrativeUnit"
                name="broadAdministrativeUnit"
                value={parkData.broadAdministrativeUnit ?? ""}
                onChange={(e) => {
                  setParkData((prev) => ({
                    ...prev,
                    broadAdministrativeUnit:
                      e.target.value !== "%CREATE" ? e.target.value : null,
                  }));
                }}
              ></Input>
            </>
          )}
        </div>
      )}
      {showError && (
        <p className="out text-lg font-semibold text-red-500">
          Para salvar uma cidade deve-se associar pelo menos uma região
          administrativa à praça
        </p>
      )}
      <div className="mt-3 flex">
        <Button onPress={goToPreviousPage}>
          <IconArrowBackUp />
        </Button>
        <Button className="ml-auto" onPress={handleGoToNextPage}>
          <IconArrowForwardUp />
        </Button>
      </div>
    </div>
  );
};

export default LocationRegisterCityForm;
