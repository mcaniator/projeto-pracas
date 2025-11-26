import { Button } from "@/components/button";
import { FetchCitiesType } from "@queries/city";
import { Dispatch, SetStateAction } from "react";

import { CreationWithoutDrawingModal } from "./creationWithouDrawingModal";

const CreationSelecion = ({
  setCurrentId,
  setDrawingWindowVisible,
  cities,
  locationCategories,
  locationTypes,
}: {
  setCurrentId: Dispatch<SetStateAction<number>>;
  setDrawingWindowVisible: Dispatch<SetStateAction<boolean>>;
  cities: FetchCitiesType;
  locationCategories: {
    statusCode: number;
    message: string;
    categories: {
      id: number;
      name: string;
    }[];
  };
  locationTypes: {
    statusCode: number;
    message: string;
    types: {
      id: number;
      name: string;
    }[];
  };
}) => {
  const handleSetCurrentId = (id: number) => {
    setCurrentId(id);
  };
  return (
    <div className="flex flex-col gap-2">
      <Button variant={"admin"} onPress={() => handleSetCurrentId(-3)}>
        Criar com desenho
      </Button>
      <CreationWithoutDrawingModal
        cities={cities}
        locationCategories={locationCategories}
        locationTypes={locationTypes}
        setCurrentId={setCurrentId}
        setDrawingWindowVisible={setDrawingWindowVisible}
      />
    </div>
  );
};

export { CreationSelecion };
