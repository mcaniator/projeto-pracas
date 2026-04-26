"use client";

import { checkIfValidLocationFeature } from "@/lib/utils/map";
import Feature, { FeatureLike } from "ol/Feature";
import { click } from "ol/events/condition";
import { createEmpty, extend, isEmpty } from "ol/extent";
import GeoJSON from "ol/format/GeoJSON";
import { Geometry, SimpleGeometry } from "ol/geom";
import { Select } from "ol/interaction";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import Text from "ol/style/Text";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";

import { FetchLocationsResponse } from "../../../lib/serverFunctions/queries/location";
import { MapContext } from "./mapProvider";

type PolygonProviderLocation = Pick<
  FetchLocationsResponse["locations"][number],
  "id" | "name" | "st_asgeojson"
>;

type PolygonProviderContextType = {
  vectorSource: VectorSource<Feature<Geometry>>;
  setVisible: (visible: boolean) => void;
};
const PolygonProviderContext = createContext<PolygonProviderContextType | null>(
  null,
);

const PolygonProvider = ({
  fullLocations,
  selectedLocation,
  selectedLocations,
  disabledLocationIds,
  children,
  isMobileView,
  disableAutoFitAfterLocationsLoad,
  handleSelectLocation,
}: {
  fullLocations: PolygonProviderLocation[];
  selectedLocation?: PolygonProviderLocation | null;
  selectedLocations?: PolygonProviderLocation[];
  disabledLocationIds?: number[];
  children: ReactNode;
  isMobileView: boolean;
  disableAutoFitAfterLocationsLoad?: boolean;
  handleSelectLocation: (id: number | null) => void;
}) => {
  const map = useContext(MapContext);
  const view = map?.getView();
  const selectedLocationIds = useMemo(() => {
    return new Set(
      selectedLocations?.map((location) => location.id) ??
        (selectedLocation ? [selectedLocation.id] : []),
    );
  }, [selectedLocation, selectedLocations]);
  const disabledLocationIdsSet = useMemo(
    () => new Set(disabledLocationIds ?? []),
    [disabledLocationIds],
  );
  const polygonsVectorSource = useMemo(
    () => new VectorSource({ wrapX: true }),
    [],
  );

  const styleFunction = useCallback(
    (feature: FeatureLike) => {
      const disabled = !!feature.getGeometry()?.get("disabled");
      const style = new Style({
        fill: new Fill({
          color: disabled ? "#6B728080" : "#1B28DE4D",
        }),
        stroke: new Stroke({
          color: disabled ? "#374151" : "#0079AB",
          lineCap: "butt",
          width: disabled ? 2 : 3,
        }),
        text: new Text({
          fill: new Fill({
            color: disabled ? "#D1D5DB" : "#FFFFFF",
          }),
          scale: 3,
          stroke: new Stroke({
            width: 1,
            color: "#000000",
          }),
          overflow: true,
          text:
            ((map?.getView().getZoom() ?? 0) > 15 ?
              feature.getGeometry()?.get("name") + ""
            : null) ?? "",
        }),
      });

      return style;
    },
    [map],
  );

  const polygonsLayer = useMemo(
    () =>
      new VectorLayer({
        source: polygonsVectorSource,
        style: styleFunction,
      }),
    [styleFunction, polygonsVectorSource],
  );

  const setVisible = (visible: boolean) => {
    polygonsLayer.setVisible(visible);
  };

  useEffect(() => {
    //Definição do estilo e comportamento dos polígonos
    const reader = new GeoJSON();
    const extent = createEmpty();
    const featureArray = fullLocations
      .filter((location) => location.st_asgeojson)
      .map((location) => {
        const geometry = reader.readGeometry(location.st_asgeojson);

        if (geometry) {
          extend(extent, geometry.getExtent());
        }

        const polygonName = location.name;
        geometry.set("name", polygonName ?? "");

        geometry.set("id", location.id);
        geometry.set("disabled", disabledLocationIdsSet.has(location.id));

        const feature = new Feature(geometry);
        feature.setId(location.id);

        return feature;
      });
    if (!disableAutoFitAfterLocationsLoad && !isEmpty(extent)) {
      view?.fit(extent, {
        padding: [100, 100, 100, isMobileView ? 100 : 600],
        duration: 500,
      });
    }

    const selectStyleFunction = (feature: FeatureLike) => {
      const style = new Style({
        fill: new Fill({
          color: "#9B59B24D",
        }),
        stroke: new Stroke({
          color: "#9B59B2",
          lineCap: "butt",
          width: 3,
        }),
        text: new Text({
          fill: new Fill({
            color: "#FFFFFF",
          }),
          scale: 3,
          stroke: new Stroke({
            width: 1,
            color: "#000000",
          }),
          overflow: true,
          text:
            ((map?.getView().getZoom() ?? 0) > 15 ?
              feature.getGeometry()?.get("name") ?
                feature.getGeometry()?.get("name") + ""
              : ""
            : null) ?? "",
        }),
      });

      return style;
    };

    polygonsVectorSource.addFeatures(featureArray);
    map?.addLayer(polygonsLayer);

    const selectInteraction = new Select({
      condition: click,
      filter: (feature) => !feature.getGeometry()?.get("disabled"),
      hitTolerance: 10,
      style: selectStyleFunction,
    });

    map?.addInteraction(selectInteraction);

    map?.on("singleclick", (evt) => {
      map?.forEachFeatureAtPixel(evt.pixel, (feature) => {
        const locationId = Number(feature.getId());
        if (disabledLocationIdsSet.has(locationId)) return;
        handleSelectLocation(locationId);
      });
    });

    map?.on("pointermove", (evt) => {
      const hit = map?.forEachFeatureAtPixel(evt.pixel, (feature) => {
        if (feature.getGeometry()?.get("disabled")) return false;
        return true;
      });

      map.getTargetElement().style.cursor = hit ? "pointer" : "default";
    });
    return () => {
      polygonsVectorSource.removeFeatures(featureArray);
      map?.removeLayer(polygonsLayer);
    };
  }, [
    map,
    fullLocations,
    polygonsVectorSource,
    polygonsLayer,
    view,
    disabledLocationIdsSet,
  ]); //Do not pass handleSelectLocation in the dependency array. It will trigger this useEffect after every location selection.

  useEffect(() => {
    //Foco no local selecionado
    for (const interaction of map?.getInteractions().getArray() ?? []) {
      if (interaction instanceof Select) {
        interaction.getFeatures().clear();
        if (selectedLocationIds.size === 0) return;

        const features = polygonsVectorSource.getFeatures();
        const selectedFeatures = features.filter((feature) =>
          selectedLocationIds.has(Number(feature.getId())),
        );
        if (!selectedFeatures.length) {
          if (isMobileView) {
            return;
          }
          //If the feature is not found, focus on the bounding box containing all features.
          const extent = features.reduce((extent, feature) => {
            extend(extent, feature.getGeometry()?.getExtent() ?? []);
            return extent;
          }, createEmpty());
          if (!isEmpty(extent)) {
            view?.fit(extent, {
              padding: [100, 100, 100, isMobileView ? 100 : 800],
              duration: 500,
            });
          }
          return;
        }
        selectedFeatures.forEach((feature) => {
          if (checkIfValidLocationFeature(feature)) {
            interaction.getFeatures().push(feature);
          }
        });
        const extent = selectedFeatures.reduce((extent, feature) => {
          const geometry = feature.getGeometry();
          if (geometry instanceof SimpleGeometry) {
            extend(extent, geometry.getExtent());
          }
          return extent;
        }, createEmpty());
        if (!isEmpty(extent)) {
          view?.fit(extent, {
            padding: [100, 100, 100, isMobileView ? 100 : 800],
            duration: 500,
          });
        }
        break;
      }
    }
  }, [selectedLocationIds, isMobileView, map, polygonsVectorSource, view]);

  return (
    <PolygonProviderContext.Provider
      value={{ vectorSource: polygonsVectorSource, setVisible }}
    >
      {children}
    </PolygonProviderContext.Provider>
  );
};

export { PolygonProviderContext };
export default PolygonProvider;
