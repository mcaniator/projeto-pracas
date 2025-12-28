"use client";

import OptionalInfoStep from "@/app/admin/map/register/registerSteps/optionalnfoStep";
import { useResettableActionState } from "@/lib/utils/useResettableActionState";
import { Step, StepLabel, Stepper } from "@mui/material";
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconCheck,
} from "@tabler/icons-react";
import Feature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import { Geometry, MultiPolygon, SimpleGeometry } from "ol/geom";
import { startTransition, useEffect, useState } from "react";

import CDialog from "../../../../components/ui/dialog/cDialog";
import {
  _createLocation,
  _updateLocation,
} from "../../../../lib/serverFunctions/serverActions/locationUtil";
import { ParkRegisterData } from "../../../../lib/types/parks/parkRegister";
import AddressStep from "./registerSteps/addressStep";
import BasicInfoStep from "./registerSteps/basicInfoStep";

const steps = ["", "", ""];

const LocationRegisterDialog = ({
  open,
  location,
  locationId,
  features,
  reloadLocations,
  reloadLocationCategories,
  reloadLocationTypes,
  reloadCities,
  onClose,
}: {
  open: boolean;
  location?: ParkRegisterData;
  locationId?: number;
  features: Feature<Geometry>[];
  reloadLocations: () => void;
  reloadLocationCategories: () => void;
  reloadLocationTypes: () => void;
  reloadCities: () => void;
  onClose: () => void;
}) => {
  const [parkData, setParkData] = useState<ParkRegisterData>(
    location ? location : (
      {
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
      }
    ),
  );
  const [featuresGeoJson, setFeaturesGeoJson] = useState("");
  const [shouldReloadLocationCategories, setShouldReloadLocationCategories] =
    useState(false);
  const [shouldReloadLocationTypes, setShouldReloadLocationTypes] =
    useState(false);
  const [shouldReloadCities, setShouldReloadCities] = useState(false);

  const handleClose = () => {
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

    onClose();
  };
  useEffect(() => {
    const coordinates: number[][][][] = [];

    for (const feature of features) {
      const geometry = feature.getGeometry();

      if (geometry instanceof SimpleGeometry) {
        coordinates.push(geometry.getCoordinates() as number[][][]);
      }
    }

    const multiPolygon = new MultiPolygon(coordinates);
    const multiPolygonFeature = new Feature(multiPolygon);

    const writer = new GeoJSON();
    const featuresGeoJsonObject =
      writer.writeFeatureObject(multiPolygonFeature);
    setFeaturesGeoJson(JSON.stringify(featuresGeoJsonObject.geometry));
  }, [features, open]);

  const [step, setStep] = useState(1);
  const [enableNextStep, setEnableNextStep] = useState(false);

  const action = !location ? _createLocation : _updateLocation;
  const [formAction] = useResettableActionState(
    _createLocation,
    {
      onSuccess() {
        reloadLocations();
        handleClose();
      },
    },
    {
      loadingMessage: "Salvando...",
    },
  );

  const handleSubmit = () => {
    const formData = new FormData();
    Object.entries(parkData).forEach(([key, value]) => {
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
      onClose={handleClose}
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
