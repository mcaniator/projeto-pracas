"use client";

import { IconFilter } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import CAccordion from "../../../../components/ui/accordion/CAccordion";
import CAccordionDetails from "../../../../components/ui/accordion/CAccordionDetails";
import CAccordionSummary from "../../../../components/ui/accordion/CAccordionSummary";
import CAutocomplete from "../../../../components/ui/cAutoComplete";
import CTextField from "../../../../components/ui/cTextField";
import { FetchCitiesResponse } from "../../../../lib/serverFunctions/queries/city";
import { LocationsWithPolygonResponse } from "../../../../lib/types/location/location";

type UnitType =
  FetchCitiesResponse["cities"][number]["narrowAdministrativeUnit"];

const Sidebar = () => {
  const [citiesOptions, setCitiesOptions] = useState<
    FetchCitiesResponse["cities"] | null
  >(null);
  const [selectedCity, setSelectedCity] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [cityAdmUnits, setCityAdmUnits] = useState<{
    narrowUnits: UnitType;
    intermediateUnits: UnitType;
    broadUnits: UnitType;
  }>({
    narrowUnits: [],
    intermediateUnits: [],
    broadUnits: [],
  });

  useEffect(() => {}, []);

  useEffect(() => {
    const cityOption = citiesOptions?.find((c) => c.id === parkData.cityId);
    setCityAdmUnits({
      broadUnits: cityOption?.broadAdministrativeUnit ?? [],
      intermediateUnits: cityOption?.intermediateAdministrativeUnit ?? [],
      narrowUnits: cityOption?.narrowAdministrativeUnit ?? [],
    });
  }, [citiesOptions]);
  return (
    <div
      className="flex w-96 flex-col gap-1 overflow-auto rounded-xl bg-white p-1"
      style={{ boxShadow: "0px 0px 10px 5px rgba(0, 0, 0, 0.1)" }}
    >
      <div className="flex flex-col gap-1 overflow-auto">
        <CAutocomplete
          label="Cidade"
          value={selectedCity ?? { id: -1, name: "Nenhuma cidade cadastrada" }}
          disableClearable
          options={citiesOptions ?? []}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          getOptionLabel={(o) => o.name}
          onChange={(_, v) => setSelectedCity(v)}
        />
        <CAccordion
          sx={{
            "&.Mui-expanded": {
              margin: 0,
            },
          }}
        >
          <CAccordionSummary>
            <div className="flex flex-row">
              <IconFilter /> Filtros
            </div>
          </CAccordionSummary>
          <CAccordionDetails>
            <div className="flex flex-col gap-1">
              <CTextField label="Nome" />
              <CAutocomplete
                label="Região administrativa ampla"
                options={cityAdmUnits.broadUnits ?? []}
              />
              <CAutocomplete
                label="Região administrativa intermendiária"
                options={cityAdmUnits.intermediateUnits ?? []}
              />
              <CAutocomplete
                label="Região administrativa estreita"
                options={cityAdmUnits.narrowUnits ?? []}
              />
              <CAutocomplete label="Categoria" options={[]} />
              <CAutocomplete label="Tipo" options={[]} />
            </div>
          </CAccordionDetails>
        </CAccordion>
      </div>
    </div>
  );
};

export default Sidebar;
