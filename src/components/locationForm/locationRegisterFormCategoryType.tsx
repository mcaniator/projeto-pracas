"use client";

import { ParkRegisterData } from "@customTypes/parks/parkRegister";
import { IconArrowBackUp, IconArrowForwardUp } from "@tabler/icons-react";
import { useState } from "react";

import { Button } from "../button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";

type SelectType = "TYPE" | "CATEGORY";
const LocationRegisterFormCategory = ({
  parkData,
  locationCategories,
  locationTypes,
  goToPreviousPage,
  goToNextPage,
  setParkData,
}: {
  parkData: ParkRegisterData;
  locationCategories: {
    statusCode: number;
    categories: {
      id: number;
      name: string;
    }[];
  };
  locationTypes: {
    statusCode: number;
    types: {
      id: number;
      name: string;
    }[];
  };
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  setParkData: React.Dispatch<React.SetStateAction<ParkRegisterData>>;
}) => {
  const [selectedType, setSelectedType] = useState(parkData.type ?? "%NULL");
  const [selectedCategory, setSelectedCategory] = useState(
    parkData.category ?? "%NULL",
  );
  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    select: SelectType,
  ) => {
    if (select === "TYPE") {
      if (e.target.value === "%CREATE" || e.target.value === "%NULL") {
        setParkData((prev) => ({ ...prev, type: null }));
      } else {
        setParkData((prev) => ({ ...prev, type: e.target.value }));
      }
      setSelectedType(e.target.value);
    } else {
      if (e.target.value === "%CREATE" || e.target.value === "%NULL") {
        setParkData((prev) => ({ ...prev, category: null }));
      } else {
        setParkData((prev) => ({ ...prev, category: e.target.value }));
      }
      setSelectedCategory(e.target.value);
    }
  };
  return (
    <div className="flex w-full max-w-[70rem] flex-col">
      <h3 className="text-lg">Categoria e tipo</h3>
      {locationCategories.statusCode !== 200 && (
        <div>
          <div className="text-red-500">
            <p className="text-xl font-semibold">Error ao buscar categorias!</p>
          </div>
        </div>
      )}
      {locationTypes.statusCode !== 200 && (
        <div>
          <div className="text-red-500">
            <p className="text-xl font-semibold">Error ao buscar tipos!</p>
          </div>
        </div>
      )}
      <label htmlFor="locationCategory" className="mt-3">
        Categoria:
      </label>
      <Select
        id="locationCategory"
        name="locationCategory"
        value={parkData.category ?? "%NONE"}
        onChange={(e) => {
          handleSelectChange(e, "CATEGORY");
        }}
      >
        <option value="%NULL"></option>
        <option value="%CREATE">REGISTRAR</option>
        {locationCategories.categories.map((category) => {
          return (
            <option value={category.name} key={category.name}>
              {category.name}
            </option>
          );
        })}
      </Select>
      {selectedCategory === "%CREATE" && (
        <>
          <label htmlFor="categoryRegister">Registrar categoria:</label>
          <Input
            maxLength={255}
            id="categoryRegister"
            name="categoryRegister"
            value={parkData.category ?? ""}
            onChange={(e) => {
              setParkData((prev) => ({ ...prev, category: e.target.value }));
            }}
          />
        </>
      )}

      <label htmlFor="locationType" className="mt-3">
        Tipo:
      </label>
      <Select
        id="locationType"
        name="locationType"
        value={parkData.type ?? "%NONE"}
        onChange={(e) => {
          handleSelectChange(e, "TYPE");
        }}
      >
        <option value="%NULL"></option>
        <option value="%CREATE">REGISTRAR</option>
        {locationTypes.types.map((type) => {
          return (
            <option value={type.name} key={type.id}>
              {type.name}
            </option>
          );
        })}
      </Select>
      {selectedType === "%CREATE" && (
        <>
          <label htmlFor="typeRegister">Registrar tipo:</label>
          <Input
            maxLength={255}
            id="typeRegister"
            name="typeRegister"
            value={parkData.type ?? ""}
            onChange={(e) => {
              setParkData((prev) => ({ ...prev, type: e.target.value }));
            }}
          />
        </>
      )}
      <div className="mt-3 flex">
        <Button onPress={goToPreviousPage}>
          <IconArrowBackUp />
        </Button>
        <Button className="ml-auto" onPress={goToNextPage}>
          <IconArrowForwardUp />
        </Button>
      </div>
    </div>
  );
};

export default LocationRegisterFormCategory;
