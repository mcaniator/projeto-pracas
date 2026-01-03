"use client";

import LocationRegisterDialog from "@/app/admin/map/register/locationRegisterDialog";
import { FetchLocationsResponse } from "@/lib/serverFunctions/queries/location";
import { _editLocationPolygon } from "@/lib/serverFunctions/serverActions/locationUtil";
import { useServerAction } from "@/lib/utils/useServerAction";
import { Divider } from "@mui/material";
import {
  IconMapOff,
  IconPencil,
  IconPolygon,
  IconX,
} from "@tabler/icons-react";
import Feature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import { Geometry, MultiPolygon, Polygon, SimpleGeometry } from "ol/geom";
import { useEffect, useState } from "react";

import CButton from "../../../../components/ui/cButton";
import { DrawingProvider } from "../drawingProvider";
import FeatureList from "./featureList";

const RegisterMenu = ({
  isEdition,
  locationToEdit,
  close,
  reloadLocations,
  reloadLocationCategories,
  reloadLocationTypes,
  reloadCities,
}: {
  isEdition: boolean;
  locationToEdit: FetchLocationsResponse["locations"][number] | null;
  close: () => void;
  reloadLocations: () => void;
  reloadLocationCategories: () => void;
  reloadLocationTypes: () => void;
  reloadCities: () => void;
}) => {
  const [_updateLocationPolygon] = useServerAction({
    action: _editLocationPolygon,
    callbacks: {
      onSuccess: () => {
        reloadLocations();
        handleClose();
      },
    },
    options: {
      showLoadingOverlay: true,
      loadingMessage: "Salvando delimitação...",
    },
  });

  const [isDrawingCreation, setIsDrawingCreation] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [features, setFeatures] = useState<Feature<Geometry>[]>([]);
  const [openLocationRegisterFormDialog, setOpenLocationRegisterFormDialog] =
    useState(false);
  const [featuresGeoJson, setFeaturesGeoJson] = useState("");

  const handleClose = () => {
    setIsDrawingCreation(false);
    setIsCreating(false);
    setFeatures([]);
    setOpenLocationRegisterFormDialog(false);
    close();
  };
  const convertFeaturesToGeoJson = () => {
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
    const stringFeatures = JSON.stringify(featuresGeoJsonObject.geometry);
    setFeaturesGeoJson(stringFeatures);
    return stringFeatures;
  };
  const handleUpdateLocationPolygon = async () => {
    //Called when user saves the polygon from an existing location, without opening the details dialog.
    if (!locationToEdit) {
      return;
    }
    const featuresGeoJson = convertFeaturesToGeoJson();
    await _updateLocationPolygon({ id: locationToEdit?.id, featuresGeoJson });
  };
  const handleOpenLocationRegisterFormDialog = () => {
    convertFeaturesToGeoJson(); //Converted features are used in register dialog.
    setOpenLocationRegisterFormDialog(true);
  };
  useEffect(() => {
    if (isEdition && locationToEdit) {
      const reader = new GeoJSON();
      const geometry = reader.readGeometry(locationToEdit?.st_asgeojson);
      if (geometry instanceof MultiPolygon) {
        const polygons = geometry.getPolygons();
        setFeatures(
          polygons.map((polygon, index) => {
            const feature = new Feature({ geometry: polygon });
            feature.setId(index);
            feature.set("description", String(index + 1));
            return feature;
          }),
        );
      }
      if (geometry instanceof Polygon) {
        // It shoulndn't happen, as the geometry is saved as a multipolygon.
        setFeatures(() => {
          const feature = new Feature({ geometry });
          feature.setId(0);
          feature.set("description", "1");
          return [feature];
        });
      }
    }
  }, [locationToEdit, isEdition]);

  return (
    <div
      className="flex max-h-full w-64 flex-col gap-1 overflow-auto rounded-xl bg-white p-1 text-black"
      style={{ boxShadow: "0px 0px 10px 5px rgba(0, 0, 0, 0.1)" }}
    >
      <div className="flex h-full flex-col gap-1 overflow-auto">
        <div className="flex items-center justify-between">
          <div className="text-xl">
            {isEdition ? "Editar praça" : "Cadastrar praça"}
          </div>
          <CButton variant="text" onClick={handleClose}>
            <IconX />
          </CButton>
        </div>
        <Divider />
        {isEdition && locationToEdit && (
          <div className="flex flex-col gap-1">
            <div>{locationToEdit.name}</div>
            <div className="text-sm">ID: {locationToEdit.id}</div>
          </div>
        )}
        {!isCreating && !isEdition && (
          <>
            <CButton
              onClick={() => {
                setIsDrawingCreation(true);
                setIsCreating(true);
              }}
            >
              <IconPencil />
              com desenho
            </CButton>
            <CButton
              onClick={() => {
                setIsCreating(true);
                setIsDrawingCreation(false);
                setFeatures([]);
                handleOpenLocationRegisterFormDialog();
              }}
            >
              <IconMapOff />
              sem desenho
            </CButton>
          </>
        )}
        {isEdition && !isCreating && (
          <>
            <CButton
              onClick={() => {
                setIsDrawingCreation(true);
                setIsCreating(true);
              }}
            >
              <IconPolygon />
              Editar delimitação
            </CButton>
            <CButton
              onClick={() => {
                handleOpenLocationRegisterFormDialog();
              }}
            >
              <IconPencil />
              Editar detalhes
            </CButton>
          </>
        )}
        {isCreating && isDrawingCreation && (
          <DrawingProvider>
            <FeatureList
              features={features}
              isEdition={isEdition}
              setFeatures={setFeatures}
              openRegisterFormDialog={() => {
                handleOpenLocationRegisterFormDialog();
              }}
              handleUpdateLocationPolygon={() => {
                void handleUpdateLocationPolygon();
              }}
            />
          </DrawingProvider>
        )}

        <LocationRegisterDialog
          featuresGeoJson={featuresGeoJson}
          location={isEdition ? locationToEdit : undefined}
          open={openLocationRegisterFormDialog}
          onFullCreationClose={() => {
            handleClose();
          }}
          onCloseDialogOnly={() => {
            setOpenLocationRegisterFormDialog(false);
            if (!isDrawingCreation) {
              setIsCreating(false);
            }
          }}
          reloadLocations={reloadLocations}
          reloadLocationCategories={reloadLocationCategories}
          reloadLocationTypes={reloadLocationTypes}
          reloadCities={reloadCities}
        />
      </div>
    </div>
  );
};

export default RegisterMenu;
