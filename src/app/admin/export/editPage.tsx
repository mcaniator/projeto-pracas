"use client";

import { Button } from "@/components/button";
import { TallyDataFetchedToTallyList } from "@/components/singleUse/admin/tallys/tallyListPage";
import { Select } from "@/components/ui/select";
import { fetchTallysByLocationId } from "@/serverActions/tallyUtil";
import {
  IconArrowBackUp,
  IconArrowBackUpDouble,
  IconArrowForwardUp,
  IconCheck,
  IconDeviceFloppy,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { ExportPageModes, SelectedLocationObj } from "./client";
import { TallyList } from "./tallyList";

type FetchedTallysStatus = "LOADING" | "LOADED" | "ERROR";
const EditPage = ({
  locationId,
  locations,
  selectedLocations,
  handlePageStateChange,
  handleSelectedLocationsSaveChange,
}: {
  locationId: number | undefined;
  locations: { id: number; name: string }[];
  selectedLocations: SelectedLocationObj[];
  handlePageStateChange: (
    id: number | undefined,
    pageMode: ExportPageModes,
  ) => void;
  handleSelectedLocationsSaveChange: (
    locationId: number,
    save: boolean,
  ) => void;
}) => {
  const [currentLocationId, setCurrentLocationId] = useState<number>();
  const [fetchedTallysStatus, setFetchedTallysStatus] =
    useState<FetchedTallysStatus>("LOADING");
  const [fetchedTallys, setFetchedTallys] = useState<
    TallyDataFetchedToTallyList[] | null
  >(null);
  useEffect(() => {
    setCurrentLocationId(locationId);
  }, [locationId]);
  useEffect(() => {
    if (currentLocationId) {
      const fetchTallys = async () => {
        try {
          const tallys = await fetchTallysByLocationId(currentLocationId);
          setFetchedTallys(tallys);
          setFetchedTallysStatus("LOADED");
        } catch (error) {
          setFetchedTallysStatus("ERROR");
        }
      };
      fetchTallys().catch(() => ({ statusCode: 1 }));
    }
  }, [currentLocationId]);
  const goToNextLocation = (save: boolean) => {
    const currentLocationIndex = selectedLocations.findIndex(
      (location) => location.id === currentLocationId,
    );
    if (currentLocationIndex < selectedLocations.length - 1) {
      const nextLocation = selectedLocations[currentLocationIndex + 1];
      if (nextLocation && currentLocationId) {
        if (save) {
          handleSelectedLocationsSaveChange(currentLocationId, true);
        }

        setCurrentLocationId(nextLocation.id);
      }
    }
  };
  const goToPreviousLocation = (save: boolean) => {
    const currentLocationIndex = selectedLocations.findIndex(
      (location) => location.id === currentLocationId,
    );
    if (currentLocationIndex > 0) {
      const previousLocation = selectedLocations[currentLocationIndex - 1];
      if (previousLocation && currentLocationId) {
        if (save) {
          handleSelectedLocationsSaveChange(currentLocationId, true);
        }
        setCurrentLocationId(previousLocation.id);
      }
    }
  };
  if (!locationId) {
    return <h4 className="text-xl font-semibold">Erro!</h4>;
  }

  const locationName =
    locations.find((location) => location.id === currentLocationId)?.name ||
    "Erro!";
  return (
    <div className="flex flex-col gap-1 overflow-auto">
      <h4 className="text-xl font-semibold">{`Selecione os parâmetros para ${locationName}`}</h4>
      <label htmlFor="assessment">Avaliação física</label>
      <Select id="assessment">
        <option value="NONE">Nenhuma</option>
      </Select>
      <h5>Contagens</h5>
      {fetchedTallysStatus === "LOADING" && <span>Carregando...</span>}
      {fetchedTallysStatus === "ERROR" && <span>Erro!</span>}
      {fetchedTallysStatus === "LOADED" && fetchedTallys?.length === 0 && (
        <span>Nenhuma contagem encontrada!</span>
      )}
      {fetchedTallys && <TallyList tallys={fetchedTallys} />}
      <span className="flex flex-row">
        {(
          selectedLocations.find(
            (location) => location.id === currentLocationId,
          )?.saved
        ) ?
          "Parâmetros salvos!"
        : "Parâmetros não salvos!"}
        {(
          selectedLocations.find(
            (location) => location.id === currentLocationId,
          )?.saved
        ) ?
          <IconCheck color="green" />
        : <IconX color="red" />}
      </span>
      <div className="my-2 flex flex-row gap-1">
        <div className="flex flex-col gap-1">
          <Button
            onPress={() => {
              handlePageStateChange(undefined, "HOME");
            }}
          >
            <IconArrowBackUpDouble size={24} />
            Voltar às praças
          </Button>

          <Button
            onPress={() => handleSelectedLocationsSaveChange(locationId, true)}
            variant={"constructive"}
          >
            <IconDeviceFloppy size={24} />
            Salvar
          </Button>
        </div>
        <div className="flex flex-col gap-1">
          <Button onPress={() => goToPreviousLocation(false)}>
            <IconArrowBackUp /> Praça anteterior
          </Button>
          <Button
            onPress={() => goToPreviousLocation(true)}
            variant={"constructive"}
          >
            <IconDeviceFloppy /> + <IconArrowBackUp />
          </Button>
        </div>
        <div className="flex flex-col gap-1">
          <Button onPress={() => goToNextLocation(false)}>
            Próxima praça <IconArrowForwardUp />
          </Button>
          <Button
            onPress={() => goToNextLocation(true)}
            variant={"constructive"}
          >
            <IconDeviceFloppy /> + <IconArrowForwardUp />
          </Button>
        </div>
      </div>
    </div>
  );
};

export { EditPage };
