"use client";

import { IconFilter, IconPlus } from "@tabler/icons-react";
import { use, useState } from "react";

import PermissionGuard from "../../../../components/auth/permissionGuard";
import CAccordion from "../../../../components/ui/accordion/CAccordion";
import CAccordionDetails from "../../../../components/ui/accordion/CAccordionDetails";
import CAccordionSummary from "../../../../components/ui/accordion/CAccordionSummary";
import CAutocomplete from "../../../../components/ui/cAutoComplete";
import CButton from "../../../../components/ui/cButton";
import CTextField from "../../../../components/ui/cTextField";
import CToggleButtonGroup from "../../../../components/ui/cToggleButtonGroup";
import { FetchCitiesType } from "../../../../lib/serverFunctions/queries/city";
import { LocationsWithPolygonResponse } from "../../../../lib/types/location/location";

const Sidebar = ({
  citiesPromise,
  locationCategoriesPromise,
  locationTypesPromise,
}: {
  citiesPromise: Promise<FetchCitiesType>;
  locationCategoriesPromise: Promise<{
    statusCode: number;
    message: string;
    categories: { id: number; name: string }[];
  }>;
  locationTypesPromise: Promise<{
    statusCode: number;
    message: string;
    types: { id: number; name: string }[];
  }>;
}) => {
  const cities = use(citiesPromise);
  const locationCategories = use(locationCategoriesPromise);
  const locationTypes = use(locationTypesPromise);
  const [selectedCity, setSelectedCity] = useState(cities.cities[0]);
  return (
    <div
      className="flex w-96 flex-col gap-1 overflow-auto rounded-xl bg-white p-1"
      style={{ boxShadow: "0px 0px 10px 5px rgba(0, 0, 0, 0.1)" }}
    >
      <div className="flex flex-col gap-1 overflow-auto">
        <CAutocomplete
          label="Cidade"
          value={selectedCity}
          disableClearable
          options={cities.cities}
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
                label="Região administrativa estreita"
                options={selectedCity?.narrowAdministrativeUnit ?? []}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                getOptionLabel={(i) => i.name}
              />
              <CAutocomplete
                label="Região administrativa intermediária"
                options={selectedCity?.intermediateAdministrativeUnit ?? []}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                getOptionLabel={(i) => i.name}
              />
              <CAutocomplete
                label="Região adminstrativa ampla"
                options={selectedCity?.broadAdministrativeUnit ?? []}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                getOptionLabel={(i) => i.name}
              />
              <CAutocomplete
                label="Categoria"
                options={locationCategories.categories}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                getOptionLabel={(i) => i.name}
              />
              <CAutocomplete
                label="Tipo"
                options={locationTypes.types}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                getOptionLabel={(i) => i.name}
              />
            </div>
          </CAccordionDetails>
        </CAccordion>
      </div>
    </div>
  );
};

export default Sidebar;
