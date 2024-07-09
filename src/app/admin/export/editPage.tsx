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
import React from "react";

import {
  ExportPageModes,
  SelectedLocationSavedObj,
  SelectedLocationTallyObj,
} from "./client";
import { TallyList } from "./tallyList";

type FetchedTallysStatus = "LOADING" | "LOADED" | "ERROR";
const EditPage = ({
  locationId,
  locations,
  selectedLocationsTallys,
  selectedLocationsSaved,
  handlePageStateChange,
  handleSelectedLocationsSaveChange,
  handleSelectedLocationsTallyChange,
}: {
  locationId: number | undefined;
  locations: { id: number; name: string }[];
  selectedLocationsTallys: SelectedLocationTallyObj[];
  selectedLocationsSaved: SelectedLocationSavedObj[];
  handlePageStateChange: (
    id: number | undefined,
    pageMode: ExportPageModes,
  ) => void;
  handleSelectedLocationsSaveChange: (
    locationId: number,
    save: boolean,
  ) => void;
  handleSelectedLocationsTallyChange: (
    locationId: number,
    tallysIds: number[] | undefined,
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
  const [selectedTallys, setSelectedTallys] = useState<number[]>([]);
  const goToNextLocation = (save: boolean) => {
    const currentLocationIndex = selectedLocationsTallys.findIndex(
      (location) => location.id === currentLocationId,
    );
    if (currentLocationIndex < selectedLocationsTallys.length - 1) {
      const nextLocation = selectedLocationsTallys[currentLocationIndex + 1];
      if (nextLocation && currentLocationId) {
        if (save) {
          handleSelectedLocationsSaveChange(currentLocationId, true);
          handleSelectedLocationsTallyChange(currentLocationId, selectedTallys);
        }
        setCurrentLocationId(nextLocation.id);
      }
    }
  };
  const goToPreviousLocation = (save: boolean) => {
    const currentLocationIndex = selectedLocationsTallys.findIndex(
      (location) => location.id === currentLocationId,
    );
    if (currentLocationIndex > 0) {
      const previousLocation =
        selectedLocationsTallys[currentLocationIndex - 1];
      if (previousLocation && currentLocationId) {
        if (save) {
          handleSelectedLocationsSaveChange(currentLocationId, true);
          handleSelectedLocationsTallyChange(currentLocationId, selectedTallys);
        }
        setCurrentLocationId(previousLocation.id);
      }
    }
  };
  const handleTallyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    removeSaveState: boolean,
  ) => {
    if (e.target.checked) {
      if (!selectedTallys.includes(Number(e.target.value)))
        setSelectedTallys((prev) => [...prev, Number(e.target.value)]);
    } else if (selectedTallys.includes(Number(e.target.value))) {
      setSelectedTallys((prev) =>
        prev.filter((tallyId) => tallyId !== Number(e.target.value)),
      );
    }
    if (removeSaveState && currentLocationId) {
      handleSelectedLocationsSaveChange(currentLocationId, false);
    }
  };
  useEffect(() => {
    const currentLocationObj = selectedLocationsTallys.find(
      (location) => location.id === currentLocationId,
    );
    if (currentLocationObj?.tallysIds)
      setSelectedTallys(currentLocationObj?.tallysIds);
  }, [currentLocationId, selectedLocationsTallys]);
  if (!locationId) {
    return <h4 className="text-xl font-semibold">Erro!</h4>;
  }

  const locationName =
    locations.find((location) => location.id === currentLocationId)?.name ||
    "Erro!";
  return (
    <div className="flex h-full flex-col gap-1 overflow-auto">
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
      {fetchedTallys && (
        <TallyList
          tallys={fetchedTallys}
          handleTallyChange={handleTallyChange}
          selectedTallys={selectedTallys}
        />
      )}
      <span className="flex flex-row">
        {(
          selectedLocationsSaved.find(
            (location) => location.id === currentLocationId,
          )?.saved
        ) ?
          "Parâmetros salvos!"
        : "Parâmetros não salvos!"}
        {(
          selectedLocationsSaved.find(
            (location) => location.id === currentLocationId,
          )?.saved
        ) ?
          <IconCheck color="green" />
        : <IconX color="red" />}
      </span>
      <div className="my-2 mt-auto flex flex-row gap-1">
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
            onPress={() => {
              if (currentLocationId) {
                handleSelectedLocationsSaveChange(currentLocationId, true);
                handleSelectedLocationsTallyChange(
                  currentLocationId,
                  selectedTallys,
                );
              }
            }}
            variant={"constructive"}
          >
            <IconDeviceFloppy size={24} />
            Salvar
          </Button>
        </div>
        <div className={"flex flex-col gap-1"}>
          <Button
            className={
              (
                selectedLocationsTallys.findIndex(
                  (location) => location.id === currentLocationId,
                ) === 0
              ) ?
                "opacity-0"
              : ""
            }
            onPress={() => goToPreviousLocation(false)}
            isDisabled={
              selectedLocationsTallys.findIndex(
                (location) => location.id === currentLocationId,
              ) === 0
            }
          >
            <IconArrowBackUp /> Praça anteterior
          </Button>
          <Button
            className={
              (
                selectedLocationsTallys.findIndex(
                  (location) => location.id === currentLocationId,
                ) === 0
              ) ?
                "opacity-0"
              : ""
            }
            onPress={() => goToPreviousLocation(true)}
            isDisabled={
              selectedLocationsTallys.findIndex(
                (location) => location.id === currentLocationId,
              ) === 0
            }
            variant={"constructive"}
          >
            <IconDeviceFloppy /> + <IconArrowBackUp />
          </Button>
        </div>
        <div className="flex flex-col gap-1">
          <Button
            onPress={() => goToNextLocation(false)}
            className={
              (
                selectedLocationsTallys.findIndex(
                  (location) => location.id === currentLocationId,
                ) ===
                selectedLocationsTallys.length - 1
              ) ?
                "opacity-0"
              : ""
            }
          >
            Próxima praça <IconArrowForwardUp />
          </Button>
          <Button
            onPress={() => {
              if (
                selectedLocationsTallys.findIndex(
                  (location) => location.id === currentLocationId,
                ) ===
                  selectedLocationsTallys.length - 1 &&
                currentLocationId
              ) {
                handleSelectedLocationsSaveChange(currentLocationId, true);
                handleSelectedLocationsTallyChange(
                  currentLocationId,
                  selectedTallys,
                );
                handlePageStateChange(undefined, "HOME");
              } else {
                goToNextLocation(true);
              }
            }}
            variant={"constructive"}
          >
            {(
              selectedLocationsTallys.findIndex(
                (location) => location.id === currentLocationId,
              ) ===
              selectedLocationsTallys.length - 1
            ) ?
              <React.Fragment>
                <IconDeviceFloppy /> + <IconArrowBackUpDouble />
              </React.Fragment>
            : <React.Fragment>
                <IconDeviceFloppy /> + <IconArrowForwardUp />
              </React.Fragment>
            }
          </Button>
        </div>
      </div>
    </div>
  );
};

export { EditPage };
