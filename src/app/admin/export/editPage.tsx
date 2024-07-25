"use client";

import { Button } from "@/components/button";
import { TallyDataFetchedToTallyList } from "@/components/singleUse/admin/tallys/tallyListPage";
import { Select } from "@/components/ui/select";
import { searchResponsesByLocation } from "@/serverActions/responseUtil";
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
  SelectedLocationObj,
  SelectedLocationSavedObj,
} from "./client";
import { SubmissionList } from "./submissionList";
import { TallyList } from "./tallyList";

type FetchedDataStatus = "LOADING" | "LOADED" | "ERROR";
/*interface FetchedSubmission{
  id: number;
  createdAt: Date
}*/
const EditPage = ({
  locationId,
  locations,
  selectedLocationsObjs,
  selectedLocationsSaved,
  handlePageStateChange,
  handleSelectedLocationsSaveChange,
  handleSelectedLocationObjChange,
}: {
  locationId: number | undefined;
  locations: { id: number; name: string }[];
  selectedLocationsObjs: SelectedLocationObj[];
  selectedLocationsSaved: SelectedLocationSavedObj[];
  handlePageStateChange: (
    id: number | undefined,
    pageMode: ExportPageModes,
  ) => void;
  handleSelectedLocationsSaveChange: (
    locationId: number,
    save: boolean,
  ) => void;
  handleSelectedLocationObjChange: (
    locationId: number,
    tallysIds: number[] | undefined,
    exportRegistrationInfo: boolean,
  ) => void;
}) => {
  const [currentLocationId, setCurrentLocationId] = useState<number>();
  const [fetchedTallysStatus, setFetchedTallysStatus] =
    useState<FetchedDataStatus>("LOADING");
  const [fetchedTallys, setFetchedTallys] = useState<
    TallyDataFetchedToTallyList[] | null
  >(null);
  const [fetchedSubmissionsStatus, setFetchedSubmissionsStatus] =
    useState<FetchedDataStatus>("LOADING");
  const [fetchedSubmissions, setFetchedSubmissions] = useState<string[]>([]);
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
      const fetchSubmissions = async () => {
        try {
          const responses = await searchResponsesByLocation(currentLocationId);
          const groupedResponses = responses.reduce(
            (acc, response) => {
              const date = response.createdAt.toISOString().split("T")[0];
              if (date) {
                if (!acc[date]) {
                  acc[date] = [];
                }
                acc[date].push(response);
              }
              return acc;
            },
            {} as { [key: string]: typeof responses },
          );
          setFetchedSubmissions(Object.keys(groupedResponses));
          setFetchedSubmissionsStatus("LOADED");
        } catch (error) {
          setFetchedSubmissionsStatus("ERROR");
        }
      };
      fetchTallys().catch(() => ({ statusCode: 1 }));
      fetchSubmissions().catch(() => ({ statusCode: 1 }));
    }
  }, [currentLocationId]);
  console.log(fetchedSubmissions);
  const [selectedTallys, setSelectedTallys] = useState<number[]>([]);
  const [exportRegistrationInfo, setExportRegistrationInfo] =
    useState<boolean>(false);
  const goToNextLocation = (save: boolean) => {
    const currentLocationIndex = selectedLocationsObjs.findIndex(
      (location) => location.id === currentLocationId,
    );
    if (currentLocationIndex < selectedLocationsObjs.length - 1) {
      const nextLocation = selectedLocationsObjs[currentLocationIndex + 1];
      if (nextLocation && currentLocationId) {
        if (save) {
          handleSelectedLocationsSaveChange(currentLocationId, true);
          handleSelectedLocationObjChange(
            currentLocationId,
            selectedTallys,
            exportRegistrationInfo,
          );
        }
        setCurrentLocationId(nextLocation.id);
      }
    }
  };
  const goToPreviousLocation = (save: boolean) => {
    const currentLocationIndex = selectedLocationsObjs.findIndex(
      (location) => location.id === currentLocationId,
    );
    if (currentLocationIndex > 0) {
      const previousLocation = selectedLocationsObjs[currentLocationIndex - 1];
      if (previousLocation && currentLocationId) {
        if (save) {
          handleSelectedLocationsSaveChange(currentLocationId, true);
          handleSelectedLocationObjChange(
            currentLocationId,
            selectedTallys,
            exportRegistrationInfo,
          );
        }
        setCurrentLocationId(previousLocation.id);
      }
    }
  };
  const handleRegistrationInfoChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setExportRegistrationInfo(e.target.checked);
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
    const currentLocationObj = selectedLocationsObjs.find(
      (location) => location.id === currentLocationId,
    );
    if (currentLocationObj) {
      setSelectedTallys(currentLocationObj.tallysIds);
      setExportRegistrationInfo(currentLocationObj.exportRegistrationInfo);
    }
  }, [currentLocationId, selectedLocationsObjs]);
  if (!locationId) {
    return <h4 className="text-xl font-semibold">Erro!</h4>;
  }

  const locationName =
    locations.find((location) => location.id === currentLocationId)?.name ||
    "Erro!";
  return (
    <div className="flex h-full flex-col gap-1 overflow-auto">
      <h4 className="text-xl font-semibold">{`Selecione os parâmetros para ${locationName}`}</h4>
      <div className="flex flex-row items-center gap-1">
        <input
          id="registration-info"
          type="checkbox"
          onChange={(e) => handleRegistrationInfoChange(e)}
          checked={exportRegistrationInfo}
        ></input>
        <label htmlFor="registration-info">Informações de cadastro</label>
      </div>

      <label htmlFor="assessment">Avaliação física</label>
      <Select id="assessment">
        <option value="NONE">Nenhuma</option>
      </Select>
      <h5>Avaliações físicas</h5>
      {fetchedSubmissionsStatus === "LOADING" && <span>Carregando...</span>}
      {fetchedSubmissionsStatus === "ERROR" && <span>Erro!</span>}
      {fetchedSubmissionsStatus === "LOADED" &&
        fetchedSubmissions?.length === 0 && (
          <span>Nenhuma avaliação física encontrada!</span>
        )}
      {fetchedSubmissions && (
        <SubmissionList dates={fetchedSubmissions}></SubmissionList>
      )}
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
                handleSelectedLocationObjChange(
                  currentLocationId,
                  selectedTallys,
                  exportRegistrationInfo,
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
                selectedLocationsObjs.findIndex(
                  (location) => location.id === currentLocationId,
                ) === 0
              ) ?
                "opacity-0"
              : ""
            }
            onPress={() => goToPreviousLocation(false)}
            isDisabled={
              selectedLocationsObjs.findIndex(
                (location) => location.id === currentLocationId,
              ) === 0
            }
          >
            <IconArrowBackUp /> Praça anteterior
          </Button>
          <Button
            className={
              (
                selectedLocationsObjs.findIndex(
                  (location) => location.id === currentLocationId,
                ) === 0
              ) ?
                "opacity-0"
              : ""
            }
            onPress={() => goToPreviousLocation(true)}
            isDisabled={
              selectedLocationsObjs.findIndex(
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
                selectedLocationsObjs.findIndex(
                  (location) => location.id === currentLocationId,
                ) ===
                selectedLocationsObjs.length - 1
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
                selectedLocationsObjs.findIndex(
                  (location) => location.id === currentLocationId,
                ) ===
                  selectedLocationsObjs.length - 1 &&
                currentLocationId
              ) {
                handleSelectedLocationsSaveChange(currentLocationId, true);
                handleSelectedLocationObjChange(
                  currentLocationId,
                  selectedTallys,
                  exportRegistrationInfo,
                );
                handlePageStateChange(undefined, "HOME");
              } else {
                goToNextLocation(true);
              }
            }}
            variant={"constructive"}
          >
            {(
              selectedLocationsObjs.findIndex(
                (location) => location.id === currentLocationId,
              ) ===
              selectedLocationsObjs.length - 1
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
