"use client";

import OptionalInfoStep from "@/app/admin/map/register/registerSteps/optionalnfoStep";
import { FetchLocationsResponse } from "@/lib/serverFunctions/queries/location";
import { getImageFromUrl } from "@/lib/utils/image";
import { useResettableActionState } from "@/lib/utils/useResettableActionState";
import { LinearProgress, Step, StepLabel, Stepper } from "@mui/material";
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconCheck,
} from "@tabler/icons-react";
import { startTransition, useEffect, useState } from "react";

import CDialog from "../../../../components/ui/dialog/cDialog";
import {
  _createLocation,
  _updateLocation,
} from "../../../../lib/serverFunctions/serverActions/locationUtil";
import { ParkRegisterData } from "../../../../lib/types/parks/parkRegister";
import AddressStep from "./registerSteps/addressStep";
import BasicInfoStep from "./registerSteps/basicInfoStep";

const defaultParkData: ParkRegisterData = {
  locationId: null,
  name: null,
  popularName: null,
  firstStreet: null,
  secondStreet: null,
  thirdStreet: null,
  fourthStreet: null,
  cityId: null,
  state: "MG",
  notes: null,
  isPark: true,
  inactiveNotFound: false,
  creationYear: null,
  lastMaintenanceYear: null,
  overseeingMayor: null,
  legislation: null,
  usableArea: null,
  legalArea: null,
  incline: null,
  categoryId: null,
  typeId: null,
  narrowAdministrativeUnitId: null,
  intermediateAdministrativeUnitId: null,
  broadAdministrativeUnitId: null,
  mainImage: null,
};

const steps = ["", "", ""];

const LocationRegisterDialog = ({
  open,
  location,
  locationId,
  featuresGeoJson,
  reloadLocations,
  reloadLocationCategories,
  reloadLocationTypes,
  reloadCities,
  onFullCreationClose,
  onCloseDialogOnly,
}: {
  open: boolean;
  location?: FetchLocationsResponse["locations"][number] | null;
  locationId?: number;
  featuresGeoJson: string;
  reloadLocations: () => void;
  reloadLocationCategories: () => void;
  reloadLocationTypes: () => void;
  reloadCities: () => void;
  onFullCreationClose: () => void;
  onCloseDialogOnly: () => void;
}) => {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [hasLoadedLocation, setHasLoadedLocation] = useState(false);
  const [hasEditedImage, setHasEditedImage] = useState(false);
  const [parkData, setParkData] = useState<ParkRegisterData>(defaultParkData);
  const [shouldReloadLocationCategories, setShouldReloadLocationCategories] =
    useState(false);
  const [shouldReloadLocationTypes, setShouldReloadLocationTypes] =
    useState(false);
  const [shouldReloadCities, setShouldReloadCities] = useState(false);

  const reset = () => {
    setHasEditedImage(false);
    if (!location) {
      setParkData(defaultParkData);
      setStep(1);
    }
  };
  const handleClose = (isFullCreationClose: boolean) => {
    if (shouldReloadCities) {
      reloadCities();
      setShouldReloadCities(false);
    }
    if (shouldReloadLocationCategories) {
      reloadLocationCategories();
      setShouldReloadLocationCategories(false);
    }
    if (shouldReloadLocationTypes) {
      reloadLocationTypes();
      setShouldReloadLocationTypes(false);
    }

    if (isFullCreationClose) {
      {
        reset();
        onFullCreationClose();
      }
    } else {
      if (!location) {
        reset();
      }
      onCloseDialogOnly();
    }
  };

  useEffect(() => {
    //Load location data
    const load = async () => {
      if (location) {
        setIsLoadingLocation(true);
        const obj = {
          locationId: location.id,
          name: location.name,
          popularName: location.popularName,
          firstStreet: location.firstStreet,
          secondStreet: location.secondStreet,
          thirdStreet: location.thirdStreet,
          fourthStreet: location.fourthStreet,
          cityId: location.cityId,
          state: location.state,
          notes: location.notes,
          isPark: location.isPark,
          inactiveNotFound: location.inactiveNotFound,
          creationYear: location.creationYear,
          lastMaintenanceYear: location.lastMaintenanceYear,
          overseeingMayor: location.overseeingMayor,
          legislation: location.legislation,
          usableArea: location.usableArea,
          legalArea: location.legalArea,
          incline: location.incline,
          categoryId: location.categoryId,
          typeId: location.typeId,
          narrowAdministrativeUnitId: location.narrowAdministrativeUnitId,
          intermediateAdministrativeUnitId:
            location.intermediateAdministrativeUnitId,
          broadAdministrativeUnitId: location.broadAdministrativeUnitId,
          mainImage: null,
        } as ParkRegisterData;
        if (location.mainImage) {
          try {
            const image = await getImageFromUrl(location.mainImage);
            if (image !== null) {
              obj.mainImage = image;
            }
          } catch (e) {
            obj.mainImage = null;
          }
        }
        setParkData(obj);
        setIsLoadingLocation(false);
        setHasLoadedLocation(true);
      } else {
        setParkData(defaultParkData);
        setIsLoadingLocation(false);
        setHasLoadedLocation(true);
      }
    };
    if (!hasLoadedLocation && open) {
      void load();
    }
  }, [location, open, hasLoadedLocation]);

  useEffect(() => {
    setStep(1);
    setHasLoadedLocation(false);
  }, [location]);

  const [step, setStep] = useState(1);
  const [enableNextStep, setEnableNextStep] = useState(false);

  const action = !location ? _createLocation : _updateLocation;
  const [formAction] = useResettableActionState({
    action: action,
    callbacks: {
      onSuccess() {
        reloadLocations();
        setStep(1);
        handleClose(true);
      },
    },
    options: {
      loadingMessage: "Salvando...",
    },
  });
  const handleSubmit = () => {
    const formData = new FormData();
    Object.entries(parkData).forEach(([key, value]) => {
      if (key === "mainImage" && !hasEditedImage) {
        //Prevent sending current location mainImage.
        return;
      }
      if (value !== null && value !== "") {
        formData.append(key, value as string);
      }
    });

    if (locationId) {
      formData.append("locationId", locationId.toString());
    }

    if (featuresGeoJson) {
      formData.append("featuresGeoJson", featuresGeoJson); // Inclui o GeoJSON no formulário
    }

    if (hasEditedImage) {
      formData.append("hasEditedImage", "true");
    } else {
      formData.append("hasEditedImage", "false");
    }
    /*if (shapefile) {
        formData.append("file", shapefile.file); //Now shapefile should be used in map
      }*/
    startTransition(() => {
      formAction(formData);
    });
  };

  const goToNextStep = () => {
    setEnableNextStep(false);
    setStep((prev) => prev + 1);
  };

  const goToPreviousStep = () => {
    setStep((prev) => prev - 1);
  };

  return (
    <CDialog
      title="Cadastro de praça"
      open={open}
      onClose={() => {
        handleClose(false);
      }}
      disableConfirmButton={!enableNextStep}
      confirmChildren={
        step === steps.length ? <IconCheck /> : <IconArrowForwardUp />
      }
      onConfirm={step === steps.length ? handleSubmit : goToNextStep}
      cancelChildren={<IconArrowBackUp />}
      disableCancelButton={step === 1}
      onCancel={goToPreviousStep}
      fullScreen
    >
      <div className="flex flex-col gap-1">
        <Stepper activeStep={step - 1}>
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {isLoadingLocation && (
          <div className="flex w-full flex-col justify-center text-lg">
            <LinearProgress />
            Carregando informações da praça...
          </div>
        )}
        {step === 1 && (
          <BasicInfoStep
            parkData={parkData}
            setParkData={setParkData}
            setEnableNextStep={setEnableNextStep}
            activateReloadLocationCategoriesOnClose={() => {
              setShouldReloadLocationCategories(true);
            }}
            activateReloadLocationTypesOnClose={() => {
              setShouldReloadLocationTypes(true);
            }}
            onImageChange={() => {
              setHasEditedImage(true);
            }}
          />
        )}
        {step === 2 && (
          <AddressStep
            parkData={parkData}
            setParkData={setParkData}
            setEnableNextStep={setEnableNextStep}
            activateReloadCitiesOnClose={() => {
              setShouldReloadCities(true);
            }}
          />
        )}
        {step === 3 && (
          <OptionalInfoStep
            parkData={parkData}
            setEnableNextStep={setEnableNextStep}
            setParkData={setParkData}
          />
        )}
      </div>
    </CDialog>
  );
};

export default LocationRegisterDialog;
