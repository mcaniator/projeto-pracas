"use client";

import { Button } from "@/components/button";
import { Checkbox } from "@/components/ui/checkbox";
import LoadingIcon from "@components/LoadingIcon";
import PermissionGuard from "@components/auth/permissionGuard";
import { useUserContext } from "@components/context/UserContext";
import { useHelperCard } from "@components/context/helperCardContext";
import { TallyDataFetchedToTallyList } from "@customTypes/tallys/tallyList";
import {
  LocationAssessment,
  fetchAssessmentsByLocation,
} from "@serverActions/assessmentUtil";
import { fetchTallysByLocationId } from "@serverActions/tallyUtil";
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
    assessments: LocationAssessment[],
    tallysIds: number[] | undefined,
    exportRegistrationInfo: boolean,
  ) => void;
}) => {
  const user = useUserContext();
  const { setHelperCard } = useHelperCard();
  const [currentLocationId, setCurrentLocationId] = useState<number>();
  const [fetchedTallysStatus, setFetchedTallysStatus] =
    useState<FetchedDataStatus>("LOADING");
  const [fetchedTallys, setFetchedTallys] = useState<
    TallyDataFetchedToTallyList[] | null
  >(null);
  const [fetchedAssessmentsStatus, setFetchedAssessmentsStatus] =
    useState<FetchedDataStatus>("LOADING");
  const [fetchedAssessments, setFetchedAssessments] = useState<
    LocationAssessment[]
  >([]);
  useEffect(() => {
    setCurrentLocationId(locationId);
  }, [locationId]);
  useEffect(() => {
    if (currentLocationId) {
      const fetchTallys = async () => {
        const response = await fetchTallysByLocationId(currentLocationId);
        if (response.statusCode === 401) {
          setHelperCard({
            show: true,
            helperCardType: "ERROR",
            content: <>Sem permissão para obter contagens!</>,
          });
        } else if (response.statusCode === 500) {
          setHelperCard({
            show: true,
            helperCardType: "ERROR",
            content: <>Erro ao obter contagens!</>,
          });
        }
        setFetchedTallys(response.tallys);
        setFetchedTallysStatus("LOADED");
      };
      const fetchAssessments = async () => {
        const response = await fetchAssessmentsByLocation(currentLocationId);
        if (response.statusCode === 401) {
          if (response.statusCode === 401) {
            setHelperCard({
              show: true,
              helperCardType: "ERROR",
              content: <>Sem permissão para obter avaliações!</>,
            });
          } else if (response.statusCode === 500) {
            setHelperCard({
              show: true,
              helperCardType: "ERROR",
              content: <>Erro ao obter avaliações!</>,
            });
          }
        }
        const assessments = response.assessments;
        setFetchedAssessments(assessments ?? []);
        setFetchedAssessmentsStatus("LOADED");
      };
      if (
        user.checkIfLoggedInUserHasAccess({ requiredAnyRoleGroups: ["TALLY"] })
      ) {
        fetchTallys().catch(() => {
          setFetchedTallysStatus("ERROR");
        });
      }
      if (
        user.checkIfLoggedInUserHasAccess({
          requiredAnyRoleGroups: ["ASSESSMENT"],
        })
      ) {
        fetchAssessments().catch(() => {
          setFetchedAssessmentsStatus("ERROR");
        });
      }
    }
  }, [currentLocationId, user, setHelperCard]);
  const [selectedAssessments, setSelectedAssessments] = useState<
    LocationAssessment[]
  >([]);
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
            selectedAssessments,
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
            selectedAssessments,
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
    removeSaveState: boolean,
  ) => {
    setExportRegistrationInfo(e.target.checked);
    if (removeSaveState && currentLocationId) {
      handleSelectedLocationsSaveChange(currentLocationId, false);
    }
  };
  const handleAssessmentChange = (
    checked: boolean,
    assessment: LocationAssessment,
    removeSaveState: boolean,
  ) => {
    if (checked) {
      if (!selectedAssessments.some((a) => a.id === assessment.id)) {
        setSelectedAssessments((prev) => [...prev, assessment]);
      }
    } else if (selectedAssessments.some((a) => a.id === assessment.id)) {
      setSelectedAssessments((prev) =>
        prev.filter((prevAssesssment) => prevAssesssment.id !== assessment.id),
      );
    }
    if (removeSaveState && currentLocationId) {
      handleSelectedLocationsSaveChange(currentLocationId, false);
    }
  };

  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 360);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleTallyChange = (
    checked: boolean,
    value: number,
    removeSaveState: boolean,
  ) => {
    if (checked) {
      if (!selectedTallys.includes(value))
        setSelectedTallys((prev) => [...prev, value]);
    } else if (selectedTallys.includes(value)) {
      setSelectedTallys((prev) => prev.filter((tallyId) => tallyId !== value));
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
      setSelectedAssessments(
        fetchedAssessments.filter((fetchedAssessment) =>
          currentLocationObj.assessments.some(
            (assessment) => assessment.id === fetchedAssessment.id,
          ),
        ),
      );
    }
  }, [currentLocationId, selectedLocationsObjs, fetchedAssessments]);
  if (!locationId) {
    return <h4 className="text-xl font-semibold">Erro!</h4>;
  }
  const locationName =
    locations.find((location) => location.id === currentLocationId)?.name ||
    "Erro!";

  return (
    <div className="flex h-full flex-col gap-1">
      <h4 className="text-xl font-semibold">{`Selecione os parâmetros para ${locationName}`}</h4>
      <div className="flex flex-row items-center gap-1">
        <Checkbox
          id="registration-info"
          onChange={(e) => handleRegistrationInfoChange(e, true)}
          checked={exportRegistrationInfo}
        />
        <label htmlFor="registration-info">Informações de cadastro</label>
      </div>
      <PermissionGuard requiresAnyRoleGroups={["ASSESSMENT"]}>
        <h5>Avaliações físicas</h5>
        {fetchedAssessmentsStatus === "LOADING" && <LoadingIcon size={48} />}
        {fetchedAssessmentsStatus === "ERROR" && <span>Erro!</span>}
        {fetchedAssessmentsStatus === "LOADED" &&
          fetchedAssessments?.length === 0 && (
            <span>Nenhuma avaliação física encontrada!</span>
          )}
        {fetchedAssessments && (
          <SubmissionList
            assessments={fetchedAssessments}
            selectedAssessments={selectedAssessments}
            handleAssessmentChange={handleAssessmentChange}
          ></SubmissionList>
        )}
      </PermissionGuard>
      <PermissionGuard requiresAnyRoleGroups={["TALLY"]}>
        <h5>Contagens</h5>
        {fetchedTallysStatus === "LOADING" && <LoadingIcon size={48} />}
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
      </PermissionGuard>
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
            className="text-xs sm:text-base"
            onPress={() => {
              handlePageStateChange(undefined, "HOME");
            }}
          >
            <IconArrowBackUpDouble
              className="h-4 w-4 sm:h-6 sm:w-6"
              size={24}
            />
            Voltar às praças
          </Button>

          <Button
            className="text-sm sm:text-base"
            onPress={() => {
              if (currentLocationId) {
                handleSelectedLocationsSaveChange(currentLocationId, true);
                handleSelectedLocationObjChange(
                  currentLocationId,
                  selectedAssessments,
                  selectedTallys,
                  exportRegistrationInfo,
                );
              }
            }}
            variant={"constructive"}
          >
            <IconDeviceFloppy className="h-4 w-4 sm:h-6 sm:w-6" size={24} />
            Salvar
          </Button>
        </div>
        <div className={"flex flex-col gap-1"}>
          <Button
            className={`text-sm sm:text-base ${
              (
                selectedLocationsObjs.findIndex(
                  (location) => location.id === currentLocationId,
                ) === 0
              ) ?
                "opacity-0"
              : ""
            }`}
            onPress={() => goToPreviousLocation(false)}
            isDisabled={
              selectedLocationsObjs.findIndex(
                (location) => location.id === currentLocationId,
              ) === 0
            }
          >
            <IconArrowBackUp className="h-4 w-4 sm:h-6 sm:w-6" />
            {!isSmallScreen && "Praça anterior"}
          </Button>
          <Button
            className={`text-sm sm:text-base ${
              (
                selectedLocationsObjs.findIndex(
                  (location) => location.id === currentLocationId,
                ) === 0
              ) ?
                "opacity-0"
              : ""
            }`}
            onPress={() => goToPreviousLocation(true)}
            isDisabled={
              selectedLocationsObjs.findIndex(
                (location) => location.id === currentLocationId,
              ) === 0
            }
            variant={"constructive"}
          >
            <IconDeviceFloppy className="h-4 w-4 sm:h-6 sm:w-6" /> +{" "}
            <IconArrowBackUp className="h-4 w-4 sm:h-6 sm:w-6" />
          </Button>
        </div>
        <div className="flex flex-col gap-1">
          <Button
            onPress={() => goToNextLocation(false)}
            className={`text-sm sm:text-base ${
              (
                selectedLocationsObjs.findIndex(
                  (location) => location.id === currentLocationId,
                ) ===
                selectedLocationsObjs.length - 1
              ) ?
                "opacity-0"
              : ""
            }`}
          >
            {!isSmallScreen && "Próxima praça"}{" "}
            <IconArrowForwardUp className="h-4 w-4 sm:h-6 sm:w-6" />
          </Button>
          <Button
            className="text-sm sm:text-base"
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
                  selectedAssessments,
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
                <IconDeviceFloppy className="h-4 w-4 sm:h-6 sm:w-6" /> +{" "}
                <IconArrowBackUpDouble className="h-4 w-4 sm:h-6 sm:w-6" />
              </React.Fragment>
            : <React.Fragment>
                <IconDeviceFloppy className="h-4 w-4 sm:h-6 sm:w-6" /> +{" "}
                <IconArrowForwardUp className="h-4 w-4 sm:h-6 sm:w-6" />
              </React.Fragment>
            }
          </Button>
        </div>
      </div>
    </div>
  );
};

export { EditPage };
///export { type SubmissionGroup };
