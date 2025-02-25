"use client";

import { IconCircleDashedCheck } from "@tabler/icons-react";
import Link from "next/link";
import React, { useActionState, useEffect, useState } from "react";

import { FetchCitiesType } from "../../serverActions/cityUtil";
import { LocationCategories } from "../../serverActions/locationCategoryUtil";
import { LocationTypes } from "../../serverActions/locationTypeUtil";
import { updateLocation } from "../../serverActions/locationUtil";
import { createLocation } from "../../serverActions/manageLocations";
import LoadingIcon from "../LoadingIcon";
import { Input } from "../ui/input";
import LocationRegisterCityForm from "./locationRegisterCityForm";
import { LocationFormType } from "./locationRegisterForm";
import LocationRegisterFormCategory from "./locationRegisterFormCategoryType";
import LocationRegisterOptionalData from "./locationRegisterOptionalData";
import RequiredParkInfoForm from "./requiredParkInfoForm";

interface ParkData {
  name: string | null;
  popularName: string | null;
  firstStreet: string | null;
  secondStreet: string | null;
  thirdStreet: string | null;
  fourthStreet: string | null;
  city: string | null;
  state: string | null;
  notes: string | null;
  isPark: boolean;
  inactiveNotFound: boolean;
  creationYear: number | null;
  lastMaintenanceYear: number | null;
  overseeingMayor: string | null;
  legislation: string | null;
  usableArea: string | null;
  legalArea: string | null;
  incline: string | null;
  category: string | null;
  type: string | null;
  hasGeometry: boolean;
  narrowAdministrativeUnit: string | null;
  intermediateAdministrativeUnit: string | null;
  broadAdministrativeUnit: string | null;
}

const initialState = {
  statusCode: -1,
  message: "Initial",
};

const LocationRegisterFormClient = ({
  hasDrawing,
  cities,
  location,
  formType,
  locationId,
  featuresGeoJson,
  locationCategories,
  locationTypes,
  onSuccess,
}: {
  hasDrawing: boolean;
  cities: FetchCitiesType;
  location?: ParkData;
  formType: LocationFormType;
  locationId?: number;
  featuresGeoJson?: string;
  locationCategories: LocationCategories;
  locationTypes: LocationTypes;
  onSuccess?: () => void;
}) => {
  const action = formType === "CREATE" ? createLocation : updateLocation;
  const [formState, formAction, isPending] = useActionState(
    action,
    initialState,
  );

  const [page, setPage] = useState(0);
  const [parkData, setParkData] = useState<ParkData>(
    location ? location : (
      {
        name: null,
        popularName: null,
        firstStreet: null,
        secondStreet: null,
        thirdStreet: null,
        fourthStreet: null,
        city: null,
        state: "%NONE",
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
        category: null,
        type: null,
        hasGeometry: false,
        narrowAdministrativeUnit: null,
        intermediateAdministrativeUnit: null,
        broadAdministrativeUnit: null,
      }
    ),
  );
  const [shapefile, setShapefile] = useState<{ file: Blob; name: string }>();
  const [registerAdministrativeUnit, setRegisterAdministrativeUnit] = useState<{
    narrow: boolean;
    intermediate: boolean;
    broad: boolean;
  }>({
    narrow: false,
    intermediate: false,
    broad: false,
  });

  useEffect(() => {
    if (formState.statusCode === 201 || formState.statusCode === 200) {
      onSuccess?.();
    }
  }, [formState.statusCode, onSuccess]);

  const goToPreviousPage = () => {
    setPage((prev) => prev - 1);
  };

  const goToNextPage = () => {
    setPage((prev) => prev + 1);
  };
  const handleSubmit = () => {
    const formData = new FormData();
    Object.entries(parkData).forEach(([key, value]) => {
      if (value !== null) {
        formData.append(key, value as string);
      }
    });

    if (locationId) {
      formData.append("locationId", locationId.toString());
    }

    if (featuresGeoJson) {
      formData.append("featuresGeoJson", featuresGeoJson); // Inclui o GeoJSON no formulário
    }
    if (shapefile) {
      formData.append("file", shapefile.file);
    }

    formAction(formData);
  };

  return (
    <div>
      {isPending && (
        <div className="flex justify-center">
          <LoadingIcon className="h-32 w-32 text-2xl" />
        </div>
      )}
      {!isPending &&
        formState.statusCode !== -1 &&
        formState.statusCode !== 201 &&
        formState.statusCode !== 200 && (
          <p className="text-xl text-red-500">Erro ao enviar!</p>
        )}
      {!isPending &&
        formState.statusCode !== 201 &&
        formState.statusCode !== 200 && (
          <form action={formAction} className={"flex flex-col gap-2"}>
            {page === 0 && (
              <RequiredParkInfoForm
                parkData={parkData}
                setParkData={setParkData}
                goToNextPage={goToNextPage}
              />
            )}
            {page === 1 && (
              <LocationRegisterCityForm
                parkData={parkData}
                cities={cities}
                goToPreviousPage={goToPreviousPage}
                goToNextPage={goToNextPage}
                setParkData={setParkData}
                registerAdministrativeUnit={registerAdministrativeUnit}
                setRegisterAdministrativeUnit={setRegisterAdministrativeUnit}
              />
            )}
            {page === 2 && (
              <LocationRegisterFormCategory
                locationCategories={locationCategories}
                locationTypes={locationTypes}
                parkData={parkData}
                goToPreviousPage={goToPreviousPage}
                goToNextPage={goToNextPage}
                setParkData={setParkData}
              />
            )}
            {page === 3 && (
              <LocationRegisterOptionalData
                hasDrawing={hasDrawing}
                parkData={parkData}
                setParkData={setParkData}
                goToPreviousPage={goToPreviousPage}
                handleSubmit={handleSubmit}
                shapefile={shapefile}
                setShapefile={setShapefile}
              />
            )}
            <Input
              type="hidden"
              value={featuresGeoJson}
              name="featuresGeoJson"
            />
          </form>
        )}
      {!isPending &&
        (formState.statusCode === 201 || formState.statusCode === 200) && (
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-2xl text-green-500">Localização registrada!</p>
            <div className="flex justify-center text-green-500">
              <IconCircleDashedCheck size={64} />
            </div>
            <Link
              href={"/admin/parks"}
              className="flex w-fit items-center justify-center rounded-lg bg-true-blue p-2 text-xl bg-blend-darken shadow-md transition-all duration-200 hover:bg-indigo-dye"
            >
              Voltar às praças
            </Link>
          </div>
        )}
    </div>
  );
};

export default LocationRegisterFormClient;
export { type ParkData };
